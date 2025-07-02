# Projeto Freguesia API

Este projeto permite ao utilizador inserir coordenadas (latitude e longitude) e receber a freguesia correspondente, com base numa base de dados PostgreSQL com extensão PostGIS.

## Como executar

1. Instala as dependências:
```
pip install -r requirements.txt
```

2. Inicia o servidor FastAPI:
```
uvicorn app.main:app --reload
```

3. Abre o ficheiro `templates/formulario.html` com um servidor local:
```
python -m http.server 8080
```

E acede em: `http://localhost:8080/formulario.html`
