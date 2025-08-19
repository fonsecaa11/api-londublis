from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from app.routers import localizacao, pois, pdf_router, ia_resume

# Criação da aplicação FastAPI
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
app.include_router(localizacao.router)  # , prefix="/api"
app.include_router(pois.router)  # , prefix="/api"
app.include_router(pdf_router.router)
app.include_router(ia_resume.router)

# Servindo arquivos estáticos da pasta "NewVersion"
app.mount("/NewVersion", StaticFiles(directory="NewVersion"), name="NewVersion")

# Rota que redireciona para o index.html
@app.get("/")
async def mostrar_formulario():
    return RedirectResponse(url="/NewVersion/1.0/index.html")