const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 3000;

// Data storage
let movies = [
  { id: 1, title: "Inception", director: "Christopher Nolan", year: 2010, genre: "Sci-Fi" },
  { id: 2, title: "The Shawshank Redemption", director: "Frank Darabont", year: 1994, genre: "Drama" },
  { id: 3, title: "The Dark Knight", director: "Christopher Nolan", year: 2008, genre: "Action" },
  { id: 4, title: "Pulp Fiction", director: "Quentin Tarantino", year: 1994, genre: "Crime" },
  { id: 5, title: "The Godfather", director: "Francis Ford Coppola", year: 1972, genre: "Crime" }
];

let series = [
  { 
    id: 1, 
    title: "Breaking Bad", 
    creator: "Vince Gilligan", 
    years: "2008-2013", 
    genre: "Drama",
    seasons: [
      { season: 1, episodes: 7 },
      { season: 2, episodes: 13 },
      { season: 3, episodes: 13 },
      { season: 4, episodes: 13 },
      { season: 5, episodes: 16 }
    ]
  },
  { 
    id: 2, 
    title: "Game of Thrones", 
    creator: "David Benioff, D.B. Weiss", 
    years: "2011-2019", 
    genre: "Fantasy",
    seasons: [
      { season: 1, episodes: 10 },
      { season: 2, episodes: 10 },
      { season: 3, episodes: 10 },
      { season: 4, episodes: 10 },
      { season: 5, episodes: 10 },
      { season: 6, episodes: 10 },
      { season: 7, episodes: 7 },
      { season: 8, episodes: 6 }
    ]
  },
  { 
    id: 3, 
    title: "Stranger Things", 
    creator: "The Duffer Brothers", 
    years: "2016-present", 
    genre: "Sci-Fi/Horror",
    seasons: [
      { season: 1, episodes: 8 },
      { season: 2, episodes: 9 },
      { season: 3, episodes: 8 },
      { season: 4, episodes: 9 }
    ]
  }
];

let songs = [
  { id: 1, title: "Bohemian Rhapsody", artist: "Queen", album: "A Night at the Opera", year: 1975, genre: "Rock" },
  { id: 2, title: "Billie Jean", artist: "Michael Jackson", album: "Thriller", year: 1982, genre: "Pop" },
  { id: 3, title: "Imagine", artist: "John Lennon", album: "Imagine", year: 1971, genre: "Rock" },
  { id: 4, title: "Smells Like Teen Spirit", artist: "Nirvana", album: "Nevermind", year: 1991, genre: "Grunge" },
  { id: 5, title: "Hey Jude", artist: "The Beatles", album: "The Beatles Again", year: 1968, genre: "Rock" },
  { id: 6, title: "Like a Rolling Stone", artist: "Bob Dylan", album: "Highway 61 Revisited", year: 1965, genre: "Folk Rock" }
];

// Helper function to get next ID
const getNextId = (array) => {
  return array.length > 0 ? Math.max(...array.map(item => item.id)) + 1 : 1;
};

// Helper function to parse JSON body from request
const getRequestBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const parsedBody = body ? JSON.parse(body) : {};
        resolve(parsedBody);
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', (error) => {
      reject(error);
    });
  });
};

// Helper function to extract ID from URL
const extractIdFromUrl = (path) => {
  const parts = path.split('/');
  return parts.length > 2 ? parseInt(parts[2]) : null;
};

// Helper function to determine if request wants HTML
const wantsHtml = (req) => {
  const accept = req.headers.accept || '';
  return accept.includes('text/html');
};

// Helper function to generate HTML page
const generateHtmlPage = (title, content) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f5f5f5;
        }
        header {
          background-color: #2c3e50;
          color: white;
          padding: 1rem;
          border-radius: 5px;
          margin-bottom: 20px;
        }
        h1 {
          margin: 0;
        }
        nav {
          margin: 20px 0;
        }
        nav a {
          margin-right: 15px;
          color: #3498db;
          text-decoration: none;
          font-weight: bold;
        }
        nav a:hover {
          text-decoration: underline;
        }
        .container {
          background-color: white;
          border-radius: 5px;
          padding: 20px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .item {
          background-color: #f9f9f9;
          border-left: 4px solid #3498db;
          padding: 15px;
          margin-bottom: 15px;
          border-radius: 0 5px 5px 0;
        }
        .item h3 {
          margin-top: 0;
          color: #2c3e50;
        }
        .item p {
          margin: 5px 0;
        }
        .seasons {
          margin-left: 20px;
        }
        .season {
          margin-bottom: 5px;
        }
        footer {
          margin-top: 30px;
          text-align: center;
          color: #7f8c8d;
          font-size: 0.9rem;
        }
        .not-found {
          text-align: center;
          padding: 50px;
        }
        .not-found h2 {
          font-size: 3rem;
          color: #e74c3c;
        }
      </style>
    </head>
    <body>
      <header>
        <h1>Media Server</h1>
      </header>
      <nav>
        <a href="/">Home</a>
        <a href="/movies">Movies</a>
        <a href="/series">TV Series</a>
        <a href="/songs">Songs</a>
      </nav>
      <div class="container">
        ${content}
      </div>
      <footer>
        <p>Media Server API - Built with Node.js</p>
      </footer>
    </body>
    </html>
  `;
};

// Generate home page content
const generateHomeContent = () => {
  return `
    <h2>Welcome to the Media Server</h2>
    <p>This is a simple Node.js server that provides access to movies, TV series, and songs data.</p>
    
    <h3>Available Endpoints:</h3>
    <div class="item">
      <h3>Movies</h3>
      <p><strong>GET /movies</strong> - Get all movies</p>
      <p><strong>POST /movies</strong> - Add a new movie</p>
      <p><strong>PUT /movies/:id</strong> - Update a movie</p>
      <p><strong>DELETE /movies/:id</strong> - Delete a movie</p>
    </div>
    
    <div class="item">
      <h3>TV Series</h3>
      <p><strong>GET /series</strong> - Get all series</p>
      <p><strong>POST /series</strong> - Add a new series</p>
      <p><strong>PUT /series/:id</strong> - Update a series</p>
      <p><strong>DELETE /series/:id</strong> - Delete a series</p>
    </div>
    
    <div class="item">
      <h3>Songs</h3>
      <p><strong>GET /songs</strong> - Get all songs</p>
      <p><strong>POST /songs</strong> - Add a new song</p>
      <p><strong>PUT /songs/:id</strong> - Update a song</p>
      <p><strong>DELETE /songs/:id</strong> - Delete a song</p>
    </div>
  `;
};

// Generate movies content
const generateMoviesContent = (moviesList) => {
  let content = `<h2>Movies (${moviesList.length})</h2>`;
  
  if (moviesList.length === 0) {
    content += `<p>No movies available.</p>`;
  } else {
    moviesList.forEach(movie => {
      content += `
        <div class="item">
          <h3>${movie.title} (${movie.year})</h3>
          <p><strong>Director:</strong> ${movie.director}</p>
          <p><strong>Genre:</strong> ${movie.genre}</p>
          <p><strong>ID:</strong> ${movie.id}</p>
        </div>
      `;
    });
  }
  
  return content;
};

// Generate series content
const generateSeriesContent = (seriesList) => {
  let content = `<h2>TV Series (${seriesList.length})</h2>`;
  
  if (seriesList.length === 0) {
    content += `<p>No TV series available.</p>`;
  } else {
    seriesList.forEach(series => {
      content += `
        <div class="item">
          <h3>${series.title} (${series.years})</h3>
          <p><strong>Creator:</strong> ${series.creator}</p>
          <p><strong>Genre:</strong> ${series.genre}</p>
          <p><strong>ID:</strong> ${series.id}</p>
          <div class="seasons">
            <p><strong>Seasons:</strong></p>
      `;
      
      series.seasons.forEach(season => {
        content += `
          <div class="season">
            <p>Season ${season.season}: ${season.episodes} episodes</p>
          </div>
        `;
      });
      
      content += `
          </div>
        </div>
      `;
    });
  }
  
  return content;
};

// Generate songs content
const generateSongsContent = (songsList) => {
  let content = `<h2>Songs (${songsList.length})</h2>`;
  
  if (songsList.length === 0) {
    content += `<p>No songs available.</p>`;
  } else {
    songsList.forEach(song => {
      content += `
        <div class="item">
          <h3>${song.title}</h3>
          <p><strong>Artist:</strong> ${song.artist}</p>
          <p><strong>Album:</strong> ${song.album}</p>
          <p><strong>Year:</strong> ${song.year}</p>
          <p><strong>Genre:</strong> ${song.genre}</p>
          <p><strong>ID:</strong> ${song.id}</p>
        </div>
      `;
    });
  }
  
  return content;
};

// Generate 404 content
const generate404Content = () => {
  return `
    <div class="not-found">
      <h2>404</h2>
      <p>The page you're looking for doesn't exist.</p>
    </div>
  `;
};

// Create HTTP server
const server = http.createServer(async (req, res) => {
  // Parse URL
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, '');
  const method = req.method.toUpperCase();
  
  // Check if request wants HTML
  const htmlResponse = wantsHtml(req);
  
  try {
    // Home route
    if (trimmedPath === '') {
      if (htmlResponse) {
        res.setHeader('Content-Type', 'text/html');
        res.writeHead(200);
        res.end(generateHtmlPage('Media Server', generateHomeContent()));
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify({
          message: 'Welcome to the Media Server API',
          endpoints: {
            movies: '/movies',
            series: '/series',
            songs: '/songs'
          }
        }));
      }
      return;
    }
    
    // Movies routes
    if (trimmedPath === 'movies' || trimmedPath.startsWith('movies/')) {
      const id = extractIdFromUrl(trimmedPath);
      
      if (method === 'GET') {
        if (htmlResponse) {
          res.setHeader('Content-Type', 'text/html');
          res.writeHead(200);
          res.end(generateHtmlPage('Movies', generateMoviesContent(movies)));
        } else {
          res.setHeader('Content-Type', 'application/json');
          res.writeHead(200);
          res.end(JSON.stringify(movies));
        }
      } 
      else if (method === 'POST' && trimmedPath === 'movies') {
        const body = await getRequestBody(req);
        const newMovie = {
          id: getNextId(movies),
          ...body
        };
        movies.push(newMovie);
        
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(201);
        res.end(JSON.stringify(movies));
      } 
      else if (method === 'PUT' && id) {
        const body = await getRequestBody(req);
        const index = movies.findIndex(movie => movie.id === id);
        
        if (index === -1) {
          res.setHeader('Content-Type', 'application/json');
          res.writeHead(404);
          res.end(JSON.stringify({ message: "Movie not found" }));
          return;
        }
        
        movies[index] = { ...movies[index], ...body, id };
        
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify(movies));
      } 
      else if (method === 'DELETE' && id) {
        const initialLength = movies.length;
        movies = movies.filter(movie => movie.id !== id);
        
        if (movies.length === initialLength) {
          res.setHeader('Content-Type', 'application/json');
          res.writeHead(404);
          res.end(JSON.stringify({ message: "Movie not found" }));
          return;
        }
        
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify(movies));
      } 
      else {
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(405);
        res.end(JSON.stringify({ message: "Method not allowed" }));
      }
    }
    
    // Series routes
    else if (trimmedPath === 'series' || trimmedPath.startsWith('series/')) {
      const id = extractIdFromUrl(trimmedPath);
      
      if (method === 'GET') {
        if (htmlResponse) {
          res.setHeader('Content-Type', 'text/html');
          res.writeHead(200);
          res.end(generateHtmlPage('TV Series', generateSeriesContent(series)));
        } else {
          res.setHeader('Content-Type', 'application/json');
          res.writeHead(200);
          res.end(JSON.stringify(series));
        }
      } 
      else if (method === 'POST' && trimmedPath === 'series') {
        const body = await getRequestBody(req);
        const newSeries = {
          id: getNextId(series),
          ...body
        };
        series.push(newSeries);
        
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(201);
        res.end(JSON.stringify(series));
      } 
      else if (method === 'PUT' && id) {
        const body = await getRequestBody(req);
        const index = series.findIndex(s => s.id === id);
        
        if (index === -1) {
          res.setHeader('Content-Type', 'application/json');
          res.writeHead(404);
          res.end(JSON.stringify({ message: "Series not found" }));
          return;
        }
        
        series[index] = { ...series[index], ...body, id };
        
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify(series));
      } 
      else if (method === 'DELETE' && id) {
        const initialLength = series.length;
        series = series.filter(s => s.id !== id);
        
        if (series.length === initialLength) {
          res.setHeader('Content-Type', 'application/json');
          res.writeHead(404);
          res.end(JSON.stringify({ message: "Series not found" }));
          return;
        }
        
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify(series));
      } 
      else {
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(405);
        res.end(JSON.stringify({ message: "Method not allowed" }));
      }
    }
    
    // Songs routes
    else if (trimmedPath === 'songs' || trimmedPath.startsWith('songs/')) {
      const id = extractIdFromUrl(trimmedPath);
      
      if (method === 'GET') {
        if (htmlResponse) {
          res.setHeader('Content-Type', 'text/html');
          res.writeHead(200);
          res.end(generateHtmlPage('Songs', generateSongsContent(songs)));
        } else {
          res.setHeader('Content-Type', 'application/json');
          res.writeHead(200);
          res.end(JSON.stringify(songs));
        }
      } 
      else if (method === 'POST' && trimmedPath === 'songs') {
        const body = await getRequestBody(req);
        const newSong = {
          id: getNextId(songs),
          ...body
        };
        songs.push(newSong);
        
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(201);
        res.end(JSON.stringify(songs));
      } 
      else if (method === 'PUT' && id) {
        const body = await getRequestBody(req);
        const index = songs.findIndex(song => song.id === id);
        
        if (index === -1) {
          res.setHeader('Content-Type', 'application/json');
          res.writeHead(404);
          res.end(JSON.stringify({ message: "Song not found" }));
          return;
        }
        
        songs[index] = { ...songs[index], ...body, id };
        
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify(songs));
      } 
      else if (method === 'DELETE' && id) {
        const initialLength = songs.length;
        songs = songs.filter(song => song.id !== id);
        
        if (songs.length === initialLength) {
          res.setHeader('Content-Type', 'application/json');
          res.writeHead(404);
          res.end(JSON.stringify({ message: "Song not found" }));
          return;
        }
        
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify(songs));
      } 
      else {
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(405);
        res.end(JSON.stringify({ message: "Method not allowed" }));
      }
    }
    
    // 404 for any other route
    else {
      if (htmlResponse) {
        res.setHeader('Content-Type', 'text/html');
        res.writeHead(404);
        res.end(generateHtmlPage('404 Not Found', generate404Content()));
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(404);
        res.end(JSON.stringify({ message: "Route not found" }));
      }
    }
  } catch (error) {
    console.error(error);
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(500);
    res.end(JSON.stringify({ message: "Internal server error" }));
  }
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser to view the media server`);
});