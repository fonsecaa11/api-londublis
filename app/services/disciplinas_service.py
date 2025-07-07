from app.db import get_connection
from psycopg2.extras import RealDictCursor

def get_disciplinas_by_ciclo(escola_id: str, ciclo_id: str) -> list[dict]:
    conn = get_connection()
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("""
            SELECT
              ed.disciplina,
              ed.nota_media,
              ed.ranking_nacional,
              ed.ranking_distrital
            FROM public.escola_disciplinas ed
            JOIN public.escola_info_ciclo eic
              ON ed.poi_id = eic.poi_id AND ed.ciclo_escolar_id = eic.ciclo_escolar_id
            JOIN public.poi p
              ON ed.poi_id = p.id_poi
            JOIN public.ciclo_escolar ce
              ON ed.ciclo_escolar_id = ce.id_ciclo_escolar
            WHERE p.id_poi = %s AND ce.id_ciclo_escolar = %s
            ORDER BY ce.id_ciclo_escolar, ed.disciplina;
        """, (escola_id, ciclo_id))
        return cur.fetchall()
