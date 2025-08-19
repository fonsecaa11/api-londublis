from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
import httpx
import ollama
import logging

# Configura o logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api")

@router.get("/ia-resume")  # Mudar de POST para GET
async def ia_resume(lat: float, lon: float):  # Recebe os parâmetros via query string
    logger.info(f"Lat: {lat}, Lon: {lon}")
    try:
        logger.info(f"Recebido pedido de resumo: Lat={lat}, Lon={lon}")
        
        # Chama a API de localização de forma assíncrona
        logger.info(f"Chamando a API de localização com lat={lat} e lon={lon}")
        async with httpx.AsyncClient() as client:
            response = await client.get(f"http://localhost:8000/api/freguesia?lat={lat}&lon={lon}")
        
        # Verifica se a resposta da API de localização foi bem-sucedida
        if response.status_code != 200:
            logger.error(f"Erro ao obter dados da localização. Status: {response.status_code}")
            raise HTTPException(status_code=500, detail="Erro ao obter dados da localização")
        
        logger.info("Dados da localização obtidos com sucesso.")
        freguesia_data = response.json()
        logger.info(f"Dados da freguesia: {freguesia_data}")

        # Chama a API de POIs para obter os pontos de interesse (com coordenadas)
        logger.info(f"Chamando a API de POIs com lat={lat} e lon={lon}")
        async with httpx.AsyncClient() as client:
            pois_response = await client.post("http://localhost:8000/api/pois", json={"lat": lat, "lon": lon})
        
        # Verifica se a resposta da API de POIs foi bem-sucedida
        if pois_response.status_code != 200:
            logger.error(f"Erro ao obter POIs. Status: {pois_response.status_code}")
            raise HTTPException(status_code=500, detail="Erro ao obter POIs")
        
        pois_data = pois_response.json()
        logger.info(f"POIs encontrados: {pois_data}")

        # Cria o prompt de entrada para o resumo
        pois_text = "\n".join([f"- {poi['descr_poi']} (Lat: {poi['lat']}, Lon: {poi['lon']})" for poi in pois_data])

        summary_prompt = f"""
        Com base nas seguintes informações, gera um relatório resumido sobre a qualidade de vida na região. 
        Considera os dados demográficos, econômicos e sociais, bem como os pontos de interesse locais. 
        Aqui estão os dados:
             - POIs encontrados: {pois_text}
             - Taxa de Envelhecimento: {freguesia_data['taxa_envelhecimento']}
             - Taxa de Desemprego: {freguesia_data['taxa_desemprego']}%
             - Renda Média: {freguesia_data['valor_renda_absoluto']}€
             - Taxa de Criminalidade: {freguesia_data['taxa_criminalidade']}%
             - Taxa de Mortalidade: {freguesia_data['taxa_mortalidade']}%"
        Sê suscinto e faz uma introdução de apenas uma frase. Para além disso, escreve em português de portugal.
              
        """
        logger.info("Prompt para IA gerado com sucesso.")

        # Chama o modelo de IA para gerar o resumo
        logger.info("Chamando o modelo IA para gerar o resumo...")
        try:
            response_ia = ollama.chat(model="llama3.1:8b", messages=[{"role": "user", "content": summary_prompt}])
            logger.info(f"Resposta da IA: {response_ia}")
        except Exception as e:
            logger.error(f"Erro ao chamar o modelo IA: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Erro ao chamar o modelo IA: {str(e)}")

        # Verifica se a IA respondeu com sucesso
        if 'message' in response_ia and 'content' in response_ia['message']:
            logger.info("Resumo gerado com sucesso pela IA.")
            return JSONResponse(status_code=200, content={"resumo": response_ia['message']['content']})
        
        logger.error("Erro ao obter resposta do modelo IA: 'content' não encontrado na resposta.")
        raise HTTPException(status_code=500, detail="Erro ao obter resposta do modelo IA")

    except Exception as e:
        logger.error(f"Erro interno: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")
