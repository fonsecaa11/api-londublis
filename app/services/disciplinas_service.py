from app.db import get_connection
from psycopg2.extras import RealDictCursor

def get_disciplinas_by_ciclo(escola_id: str, ciclo_id: str) -> list[dict]:
    conn = get_connection()
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("""
          SELECT
            ce.descr_ciclo_escolar,
            eic.media_global,
            eic.ranking_nacional,
            eic.ranking_distrital,
            eic.ranking_nacional_seg,
            eic.ranking_distrital_seg,
            eic.num_alunos,
            eic.perc_mulheres,
            eic.perc_homens
          FROM public.escola_info_ciclo eic
          JOIN public.poi p
            ON eic.poi_id = p.id_poi
          JOIN public.ciclo_escolar ce
            ON eic.ciclo_escolar_id = ce.id_ciclo_escolar
          WHERE p.id_poi = %s AND ce.id_ciclo_escolar = %s
      """, (escola_id, ciclo_id))

        return cur.fetchall()
