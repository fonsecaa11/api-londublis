import datetime
import hashlib
import bcrypt
import logging
from fastapi import Cookie, Depends, FastAPI, HTTPException, Response
from fastapi.responses import RedirectResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.db import get_connection
from pydantic import BaseModel
from app.routers import localizacao, pois, pdf_router, ia_resume, estatistica

# Configuração do logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)

app = FastAPI()

# Middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Incluir os routers
app.include_router(localizacao.router)
app.include_router(estatistica.router)
app.include_router(pois.router)
app.include_router(pdf_router.router)
app.include_router(ia_resume.router)

# Servindo arquivos estáticos
app.mount("/NewVersion", StaticFiles(directory="NewVersion"), name="NewVersion")

# --- MODELOS ---
class UserRegister(BaseModel):
    first_name: str
    last_name: str
    email: str
    senha: str

class UserLogin(BaseModel):
    email: str
    senha: str

# Função para gerar um token de sessão (simples)
def generate_session_token(username: str):
    # Aqui você geraria um token único, ou poderia usar JWT
    # Exemplo simples: concatenando "username" com um hash da hora atual
    return hashlib.sha256((username + str(datetime.timedelta(seconds=3600))).encode()).hexdigest()

# --- FUNÇÕES DE AJUDA ---
def email_exists(email: str) -> bool:
    logging.info(f"Verificando se o email {email} já existe na BD.")
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT id FROM users WHERE email = %s", (email,))
        exists = cur.fetchone() is not None
        logging.info(f"Email {email} existe: {exists}")
        cur.close()
        conn.close()
        return exists
    except Exception as e:
        logging.error(f"Erro ao verificar email: {e}")
        raise

# --- ENDPOINT REGISTRO ---
@app.post("/register")
def register(user: UserRegister):
    logging.info(f"Tentando registar utilizador: {user.email}")

    try:
        if email_exists(user.email):
            logging.warning(f"Email {user.email} já registado.")
            return JSONResponse({"error": "E-mail já registado."}, status_code=400)

        hashed = bcrypt.hashpw(user.senha.encode("utf-8"), bcrypt.gensalt())
        conn = get_connection()
        cur = conn.cursor()
        logging.info(f"Inserindo novo utilizador {user.email} na BD.")

        cur.execute("""
            INSERT INTO users (first_name, last_name, email, password_hash, role_id, created_at)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (user.first_name, user.last_name, user.email, hashed, 1, datetime.datetime.utcnow()))

        conn.commit()
        cur.close()
        conn.close()

        logging.info(f"Utilizador {user.email} registado com sucesso.")
        return JSONResponse({"message": "Utilizador registado com sucesso."}, status_code=201)

    except Exception as e:
        logging.error(f"Erro no registo do utilizador {user.email}: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor.")

# --- ENDPOINT LOGIN ---
@app.post("/login")
def login(user: UserLogin, response: Response):
    logging.info(f"Tentativa de login: {user.email}")

    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT id, first_name, last_name, email, password_hash, role_id FROM users WHERE email = %s", (user.email,))
        row = cur.fetchone()

        if not row:
            logging.warning(f"Login falhou: email {user.email} não encontrado.")
            return JSONResponse({"error": "Credenciais inválidas."}, status_code=401)

        stored_hash = row[4]  # password_hash
        if isinstance(stored_hash, memoryview):
            stored_hash = stored_hash.tobytes()

        # Verificar se a senha está correta
        if bcrypt.checkpw(user.senha.encode("utf-8"), stored_hash):
            role = "admin" if row[5] == 2 else "user"
            redirect_url = "/NewVersion/dashboard.html" if role == "admin" else "/NewVersion/index.html"
            
            # Gerar o token de sessão (aqui usamos um hash simples, mas em produção seria melhor usar JWT)
            session_token = hashlib.sha256(f"{user.email}-{row[0]}".encode()).hexdigest()

            # Salvar o cookie de sessão com a expiração de 1 hora
            response.set_cookie(
                key="session_token", 
                value=session_token, 
                httponly=True,   # Impede o acesso via JavaScript
                max_age=3600,    # Expira em 1 hora
                secure=True,     # Garante que o cookie seja transmitido apenas por HTTPS (necessário em produção)
                samesite="Strict"  # Previne ataques CSRF
            )

            logging.info(f"Login bem-sucedido: {user.email} | Role: {role}")

            return JSONResponse({
                "email": user.email,
                "message": f"Login bem-sucedido! Bem-vindo(a) {row[1]}",
                "role": role,
                "redirect": redirect_url
            }, status_code=200)
        else:
            logging.warning(f"Login falhou: senha incorreta para {user.email}")
            return JSONResponse({"error": "Credenciais inválidas."}, status_code=401)

    except Exception as e:
        logging.error(f"Erro no login do utilizador {user.email}: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor.")

    finally:
        try:
            cur.close()
            conn.close()
        except:
            pass

# Endpoint de logout
@app.post("/logout")
async def logout(response: JSONResponse):
    response.delete_cookie("session_token")
    return JSONResponse(content={"message": "Logout bem-sucedido"})

# --- Rota root ---
@app.get("/")
async def mostrar_formulario():
    return RedirectResponse(url="/NewVersion/home.html")


# Endpoint para registrar o início da sessão
@app.post("/sessions/")
def create_session(user_id: int, device_type: str):
    # Conectar à base de dados
    conn = get_connection()
    cur = conn.cursor()

    # Query para adicionar a sessão
    query = """
        INSERT INTO sessions (user_id, device_type, start_time)
        VALUES (%s, %s, %s)
        RETURNING id;
    """
    
    # Executar a query com os dados do utilizador
    cur.execute(query, (user_id, device_type, datetime.now()))
    
    # Obter o ID da nova sessão
    session_id = cur.fetchone()[0]
    
    # Confirmar a transação e fechar a conexão
    conn.commit()
    cur.close()
    conn.close()

    # Retornar o ID da sessão criada
    return {"session_id": session_id}

@app.post("/page_views/")
def create_page_view(session_id: int, page_url: str, time_spent: int):
    # Conectar à base de dados
    conn = get_connection()
    cur = conn.cursor()

    # Query para registrar a página visitada
    query = """
        INSERT INTO page_views (session_id, page_url, time_spent, visit_time)
        VALUES (%s, %s, %s, %s)
        RETURNING id;
    """
    
    # Executar a query para adicionar os dados da página
    cur.execute(query, (session_id, page_url, f"{time_spent} seconds", datetime.now()))
    
    # Obter o ID da página visitada
    page_view_id = cur.fetchone()[0]

    # Confirmar e fechar a conexão
    conn.commit()
    cur.close()
    conn.close()

    # Retornar o ID da página visitada
    return {"page_view_id": page_view_id}


@app.post("/searches/")
def create_search(user_id: int, search_term: str, district: str, county: str):
    # Conectar à base de dados
    conn = get_connection()
    cur = conn.cursor()

    # Query para registrar a pesquisa
    query = """
        INSERT INTO searches (user_id, search_term, district, county, search_time)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING id;
    """
    
    # Executar a query para adicionar a pesquisa
    cur.execute(query, (user_id, search_term, district, county, datetime.now()))
    
    # Obter o ID da pesquisa
    search_id = cur.fetchone()[0]

    # Confirmar e fechar a conexão
    conn.commit()
    cur.close()
    conn.close()

    # Retornar o ID da pesquisa
    return {"search_id": search_id}

# Função para verificar o cookie de sessão
def get_session_token(session_token: str = Cookie(None)):
    if not session_token:
        raise HTTPException(status_code=401, detail="Sessão expirada ou não encontrada")
    return session_token

@app.get("/profile")
async def profile(session_token: str = Depends(get_session_token)):
    # Aqui você pode usar o token para validar a sessão, por exemplo,
    # verificando no banco de dados se o token corresponde a um usuário válido.
    # Este é um exemplo básico, onde estamos apenas retornando o token.
    
    return {"message": "Usuário logado", "session_token": session_token}

