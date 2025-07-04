from app.db import get_connection
import psycopg2
import requests
from psycopg2.extras import RealDictCursor

def get_pois_around(lat: float, lon: float, min_pois: int = 10, max_raio: int = 10000) -> list[dict]:
    try:
        conn = get_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            raio = 500
            resultados = []

            print(f"📩 Coordenadas recebidas: lat={lat}, lon={lon}")

            while raio <= max_raio:
                print(f"🔍 Buscando POIs com raio: {raio} metros")

                cur.execute("""
                    SELECT p.id_poi, p.descr_poi, e.descr_entidade,
                           s.descr_subcategoria, c.descr_categoria,
                           ST_Y(p.geom) AS lat, ST_X(p.geom) AS lon
                    FROM poi p
                    JOIN entidade e ON p.entidade_id = e.id_entidade
                    JOIN subcategoria s ON e.subcategoria_id = s.id_subcategoria
                    JOIN categoria c ON s.categoria_id = c.id_categoria
                    WHERE ST_DWithin(
                        ST_Transform(p.geom, 3857),
                        ST_Transform(ST_SetSRID(ST_MakePoint(%(lon)s, %(lat)s), 4326), 3857),
                        %(raio)s
                    )
                """, {"lat": lat, "lon": lon, "raio": raio})

                rows = cur.fetchall()
                print(f"🔢 {len(rows)} POIs encontrados no raio de {raio}m")

                for poi in rows:
                    dist = get_pedestrian_distance(lat, lon, poi["lat"], poi["lon"])
                    if dist is not None and dist <= 1000:
                        poi["distancia_pedonal_m"] = round(dist, 2)
                        poi["tipo"] = "poi"
                        resultados.append(poi)

                if len(resultados) >= min_pois:
                    break  # Encontrámos POIs suficientes dentro do raio e distância a pé

                raio += 500

            print(f"📦 Resultado final: {len(resultados)} POIs com distância pedonal <= 1000m")
            return resultados

    except Exception as e:
        print(f"❌ Erro ao obter POIs: {e}")
        return []

def get_pedestrian_distance(lat1, lon1, lat2, lon2):
    try:
        url = f"http://localhost:5000/route/v1/foot/{lon1},{lat1};{lon2},{lat2}?overview=false"
        resp = requests.get(url)
        if resp.status_code == 200:
            data = resp.json()
            return data['routes'][0]['distance']  # em metros
    except Exception as e:
        print(f"⚠️ Erro ao calcular distância pedonal: {e}")
    return None
