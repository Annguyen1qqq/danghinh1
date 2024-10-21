document.querySelectorAll('form[action^="/delete/"]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      if (!confirm('Are you sure you want to delete this file?')) {
        e.preventDefault();
      }
    });
  });
  
  // Simple admin middleware
function isAdmin(req, res, next) {
    const password = req.query.password; // You can change this method to a better approach
    if (password === 'admin_password') {
      next(); // If password matches, proceed
    } else {
      res.status(500).send('Forbidden: You do not have permission to delete files.');
    }
  }
  