# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
# StoryEchoes

# APIs
The mock API is powered by json-server and uses the db.json file to simulate a backend. Below are the API details:

1. Get All Stories
Endpoint: http://localhost:400/stories
Method: GET
Response:
json

[
  {
    "id": "1",
    "title": "Nibbles and the Perfect Hat",
    "imageforstorytile": "./src/assets/Story1images/imageforstorytile.jpg",
    "description": "Follow Nibbles the garden gnome as he embarks on an adventure to find the perfect hat fit."
  },
  ...
]


2. Get Single Story
Endpoint: http://localhost:400/stories/:id
Method: GET
Response:
json

{
  "id": "1",
  "title": "Nibbles and the Perfect Hat",
  "front_cover": "/path_to_image/front_cover.jpg",
  "back_cover": "/path_to_image/back_cover.jpg",
  "content": [
    {
      "page": 1,
      "text": "Nibbles the garden gnome loved his hat...",
      "image": "/path_to_image/Story1images/page1.jpg"
    },
    ...
  ]
}

3. Add a New Story. Here the id for the new books is assigned by the json server. 

Endpoint: http://localhost:400/stories
Method: POST
Request Body:
json

{
  "id": "3",
  "title": "A New Adventure",
  "description": "An amazing new story for young readers.",
  "front_cover": "/path_to_image/front_cover.jpg",
  "back_cover": "/path_to_image/back_cover.jpg",
  "content": [
    {
      "page": 1,
      "text": "This is the first page of the new adventure.",
      "image": "/path_to_image/page1.jpg"
    },
    {
      "page": 2,
      "text": "This is the second page of the new adventure.",
      "image": "/path_to_image/page2.jpg"
    }
  ]
}

Response:
{
  "id": "3",
  "title": "A New Adventure",
  "description": "An amazing new story for young readers.",
  "front_cover": "/path_to_image/front_cover.jpg",
  "back_cover": "/path_to_image/back_cover.jpg",
  "content": [
    {
      "page": 1,
      "text": "This is the first page of the new adventure.",
      "image": "/path_to_image/page1.jpg"
    },
    {
      "page": 2,
      "text": "This is the second page of the new adventure.",
      "image": "/path_to_image/page2.jpg"
    }
  ]
}

# Please Note : 

As this is a Mock backend ensure please use port 400 while starting the db json:

json-server --watch db.json --port 400 


# API Integration: 

Fetches and manages story data dynamically from a mock backend.

# Components

1. WonderShelf.jsx

Fetches all story data using the GET /stories API.

2. ReadStory.jsx.

Fetches individual story data using the GET /stories/:id API.

3. ReadStory.css 

Styling file used by the component ReadStory.jsx.

4. WonderShelf.css 

Styling file used by the component WonderShelf.jsx

5. Footer.jsx

Used for displaying footer at the bottom of each page.

6. Footer.css 

Styling file used by the component Footer.jsx





