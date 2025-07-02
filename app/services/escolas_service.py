from app.db import get_connection
import psycopg2
from psycopg2.extras import RealDictCursor

def get_escola_by_id(escola_id: str) -> dict | None:
    conn = get_connection()
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("""
            SELECT p.id_poi, p.descr_poi, e.descr_entidade, 
                   s.descr_subcategoria, c.descr_categoria,
                   ST_X(p.geom) AS lon, ST_Y(p.geom) AS lat
            FROM poi p
            JOIN entidade e ON p.entidade_id = e.id_entidade
            JOIN subcategoria s ON e.subcategoria_id = s.id_subcategoria
            JOIN categoria c ON s.categoria_id = c.id_categoria
            WHERE p.id_poi = %s
        """, (escola_id,))
        return cur.fetchone()


def get_estatisticas_by_escola(escola_id: str) -> list[dict]:
    conn = get_connection()
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("""
            SELECT ce.descr_ciclo_escolar,
            	   e.coddgeec,
            	   e.natureza_institucional,
            	   e.num_alunos,
            	   e.perc_mulheres,
            	   e.perc_homens,
                   e.media_global,
                   e.ranking_nacional,
                   e.ranking_distrital,
            	   e.ranking_nacional_seg,
                   e.ranking_distrital_seg
            FROM ciclo_escolar ce
            LEFT JOIN escola_info_ciclo e ON ce.id_ciclo_escolar = e.ciclo_escolar_id AND e.poi_id = %s
            WHERE ce.id_ciclo_escolar IN (
                SELECT DISTINCT ciclo_escolar_id FROM poi_ciclo_escolar WHERE poi_id = %s
            );
        """, (escola_id, escola_id))
        return cur.fetchall()

