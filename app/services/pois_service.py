from app.db import get_connection
import psycopg2
from psycopg2.extras import RealDictCursor
from app.services.colocacoes_service import get_universidade_colocacoes_cursos
from app.services.escolas_service import get_estatisticas_by_escola

def get_pois_around(lat: float, lon: float, min_pois: int = 10, max_raio: int = 10000) -> list[dict]:
    try:
        conn = get_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            raio = 500
            pois = []

            print(f"📩 Coordenadas recebidas: lat={lat}, lon={lon}")

            while raio <= max_raio:
                print(f"🔍 Buscando POIs com raio: {raio} metros")
                cur.execute(""" 
                    SELECT p.id_poi, p.descr_poi, e.descr_entidade, 
                           s.descr_subcategoria, c.descr_categoria,
                           ST_X(p.geom) AS lon, ST_Y(p.geom) AS lat
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

                if len(rows) >= min_pois:
                    pois = rows
                    break

                raio += 500

            for poi in pois:
                poi["tipo"] = "poi"

            print(f"📦 Resultado final: {len(pois)} POIs")
            return pois

    except Exception as e:
        print(f"❌ Erro ao obter POIs: {e}")
        return []

