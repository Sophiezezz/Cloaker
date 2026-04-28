import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { db } from "./src/lib/db.ts";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Redirection route
  app.get("/redirect", async (req, res) => {
    const query = req.query.query as string;
    
    if (!query) {
        return res.redirect('/'); 
    }

    try {
        // Consulta no DB
        const { rows } = await db.query(
            'SELECT target_url FROM cloaker_rules WHERE query_id = $1 AND status = $2', 
            [query, 'active']
        );

        if (rows.length === 0) {
            // Regra não encontrada ou desativada
            return res.redirect('/'); 
        }

        // Redireciona para o destino final registrado
        res.redirect(rows[0].target_url);
    } catch (e) {
        console.error(e);
        res.redirect('/');
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
