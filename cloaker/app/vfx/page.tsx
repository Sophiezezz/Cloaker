import { redirect } from 'react-router-dom';
import { db } from '../../../lib/db';

export default async function Page({ searchParams }: { searchParams: Promise<{ query: string }> }) {
    const { query } = await searchParams;
    
    // Se não tiver a query correta, bloqueia
    if (!query) {
        redirect('/'); 
    }

    try {
        // Consulta no DB
        const { rows } = await db.query(
            'SELECT target_url FROM cloaker_rules WHERE query_id = $1 AND status = $2', 
            [query, 'active']
        );

        if (rows.length === 0) {
            // Regra não encontrada ou desativada
            redirect('/'); 
        }

        // Redireciona para o destino final registrado
        redirect(rows[0].target_url);
    } catch (e) {
        console.error(e);
        redirect('/');
    }
}
