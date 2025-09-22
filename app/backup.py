from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from app.routers import localizacao, pois, pdf_router
from app.db import get_connection  # Ajusta o import conforme estrutura
import bcrypt
import psycopg2
from fastapi import HTTPException
import bcrypt
from fastapi import HTTPException, Form
from psycopg2 import Binary
from fastapi.responses import RedirectResponse

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
app.include_router(localizacao.router) #, prefix="/api"
app.include_router(pois.router) #, prefix="/api"
app.include_router(pdf_router.router)

# Templates
templates = Jinja2Templates(directory="app/templates")

@app.get("/login/register", response_class=HTMLResponse)
async def login_register(request: Request):
    return templates.TemplateResponse("login/register.html", {"request": request})

@app.get("/formulario")
def mostrar_formulario(request: Request, user_id: int, role_id: int):
    return templates.TemplateResponse("formulario.html", {
        "request": request,
        "user_id": user_id,
        "role_id": role_id
    })

@app.get("/dashboard")
def mostrar_dashboard(request: Request, user_id: int, role_id: int):
    return templates.TemplateResponse("dashboard.html", {
        "request": request,
        "user_id": user_id,
        "role_id": role_id
    })

@app.get("/", response_class=RedirectResponse)
async def homepage_redirect():
    return RedirectResponse(url="/login/register")

@app.get("/login/register", response_class=HTMLResponse)
async def login_register(request: Request):
    return templates.TemplateResponse("login/register.html", {"request": request})


@app.post("/login/register")
async def handle_register(
    email: str = Form(...),
    password: str = Form(...),
    confirm: str = Form(None)
):
    if confirm and password != confirm:
        return JSONResponse({"error": "As senhas não coincidem."}, status_code=400)

    try:
        conn = get_connection()
        cur = conn.cursor()

        # Verificar se já existe o e-mail
        cur.execute("SELECT id FROM users WHERE email = %s", (email,))
        if cur.fetchone():
            return JSONResponse({"error": "E-mail já registado."}, status_code=400)

        # Hash da password
        hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

        cur.execute("""
            INSERT INTO users (email, password_hash, role_id)
            VALUES (%s, %s, %s)
        """, (email, Binary(hashed), 2))  # 2 é o ID do papel "utilizador" (user)

        conn.commit()
        cur.close()
        conn.close()

        return JSONResponse({"message": "Utilizador registado com sucesso."}, status_code=201)

    except Exception as e:
        print("Erro:", e)
        return JSONResponse({"error": "Erro no servidor."}, status_code=500)
    
    from fastapi import HTTPException

from fastapi.responses import JSONResponse

@app.post("/login")
async def handle_login(email: str = Form(...), password: str = Form(...)):
    try:
        conn = get_connection()
        cur = conn.cursor()

        cur.execute("SELECT id, password_hash,role_id FROM users WHERE email = %s", (email,))
        result = cur.fetchone()

        if not result:
            raise HTTPException(status_code=401, detail="Utilizador não encontrado")

        user_id, stored_hash, role_id = result
        stored_hash = bytes(stored_hash)

        if not bcrypt.checkpw(password.encode(), stored_hash):
            raise HTTPException(status_code=401, detail="Senha incorreta")

        # Em vez de redirecionar, devolve JSON com o ID
        return JSONResponse(content={"user_id": user_id, "role_id": role_id}, status_code=200)

    except Exception as e:
        print("Erro:", e)
        raise HTTPException(status_code=500, detail="Erro interno no login")

@app.get("/perfil", response_class=HTMLResponse)
async def perfil_page(request: Request, user_id: int):
    try:
        conn = get_connection()
        cur = conn.cursor()

        # Buscar perfil ou criar vazio se não existir
        cur.execute("""
            SELECT full_name, avatar_url, bio FROM user_profiles WHERE user_id = %s
        """, (user_id,))
        profile = cur.fetchone()

        profile_data = {
            "full_name": profile[0] if profile else "",
            "avatar_url": profile[1] if profile else "",
            "bio": profile[2] if profile else "",
        }

        return templates.TemplateResponse("perfil.html", {
            "request": request,
            "user_id": user_id,
            "profile": profile_data
        })

    except Exception as e:
        print("Erro ao carregar perfil:", e)
        raise HTTPException(status_code=500, detail="Erro ao carregar perfil")

@app.post("/perfil/update")
async def update_profile(
    user_id: int = Form(...),
    full_name: str = Form(""),
    avatar_url: str = Form(""),
    bio: str = Form("")
):
    try:
        conn = get_connection()
        cur = conn.cursor()

        # Verificar se perfil já existe
        cur.execute("SELECT id FROM user_profiles WHERE user_id = %s", (user_id,))
        existing = cur.fetchone()

        if existing:
            cur.execute("""
                UPDATE user_profiles
                SET full_name = %s, avatar_url = %s, bio = %s
                WHERE user_id = %s
            """, (full_name, avatar_url, bio, user_id))
        else:
            cur.execute("""
                INSERT INTO user_profiles (user_id, full_name, avatar_url, bio)
                VALUES (%s, %s, %s, %s)
            """, (user_id, full_name, avatar_url, bio))

        conn.commit()
        cur.close()
        conn.close()

        return RedirectResponse(url=f"/formulario?user_id={user_id}", status_code=302)

    except Exception as e:
        print("Erro ao atualizar perfil:", e)
        raise HTTPException(status_code=500, detail="Erro ao atualizar perfil")

