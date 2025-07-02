from psycopg2.extras import RealDictCursor
from app.db import get_connection

def get_universidade_colocacoes_cursos(poi_id: str, ciclo_escolar_id: str) -> list[dict]:
    conn = get_connection()
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("""
            SELECT fc.codcurso,
                   fc.nome_curso,
                   fc.grau,
                   fc.nivel_formacao,
                   fc.tipo_ensino,
                   fc.forma_ingresso,
                   fc.natureza_institucional,
                   fc.vagas_iniciais,
                   COALESCE(c.colocados, fc.colocados) AS colocados,
                   COALESCE(c.nota_ultimo_colocado, fc.nota_ultimo_colocado) AS nota_ultimo_colocado,
                   c.ano_colocacao
            FROM faculdade_cursos fc
            LEFT JOIN colocacoes c
              ON c.poi_id = fc.poi_id
             AND c.ciclo_escolar_id = fc.ciclo_escolar_id
             AND c.codcurso = fc.codcurso
            WHERE fc.poi_id = %s
              AND fc.ciclo_escolar_id = %s
            ORDER BY fc.nome_curso
        """, (poi_id, ciclo_escolar_id))
        return cur.fetchall()

