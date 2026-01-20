// In-memory storage (resets on cold start)
let todos = [];

export default function handler(req, res) {
  const { method } = req;

  // Get ID from query string for specific todo operations
  const id = req.query.id ? parseInt(req.query.id) : null;

  switch (method) {
    case 'GET':
      return res.status(200).json(todos);

    case 'POST':
      const newTodo = {
        id: Date.now(),
        text: req.body.text,
        completed: false,
        createdAt: new Date().toISOString()
      };
      todos.push(newTodo);
      return res.status(201).json(newTodo);

    case 'PUT':
      if (id) {
        const index = todos.findIndex(todo => todo.id === id);
        if (index === -1) {
          return res.status(404).json({ error: 'TODO not found' });
        }
        todos[index] = { ...todos[index], ...req.body };
        return res.status(200).json(todos[index]);
      }
      return res.status(400).json({ error: 'ID required' });

    case 'DELETE':
      if (id) {
        const index = todos.findIndex(todo => todo.id === id);
        if (index === -1) {
          return res.status(404).json({ error: 'TODO not found' });
        }
        const deleted = todos.splice(index, 1);
        return res.status(200).json(deleted[0]);
      }
      return res.status(400).json({ error: 'ID required' });

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
