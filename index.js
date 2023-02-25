const express = require("express");
var morgan = require("morgan");
const cors = require("cors");

const app = express();

app.use(morgan("tiny"));

app.use(
  morgan(function (tokens, req, res) {
    if (req.method == "POST") {
      return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, "content-length"),
        "-",
        tokens["response-time"](req, res),
        "ms",
        JSON.stringify(req.body),
      ].join(" ");
    }
  })
);

app.use(express.json());

app.use(cors());

app.use(express.static("build"));

let persons = [
  {
    name: "Mary Poppendieck",
    number: "39-23-6423122",
    id: 4,
  },
  {
    name: "nimi",
    number: "11111",
    id: 5,
  },
  {
    name: "nimi2",
    number: "21111",
    id: 6,
  },
];

app.get("/", (req, res) => {
  res.send("Phonebook api");
});

app.get("/api/persons", (req, res) => {
  res.json(persons);
});

app.get("/info", (req, res) => {
  const date = new Date().toUTCString();
  res.json(`Phonebook has info for ${persons.length} people
  ${date}`);
});

app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find((person) => person.id === id);
  if (!person) {
    res.status(404).end();
    return;
  }
  res.json(person);
});

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter((person) => person.id !== id);
  res.status(204).end();
});

app.post("/api/persons", (req, res) => {
  const person = req.body;

  if (!person.number) {
    return res.status(400).json({
      error: "number missing",
    });
  }
  if (!person.name) {
    return res.status(400).json({
      error: "name missing",
    });
  }

  if (persons.find((p) => p.name === person.name)) {
    return res.status(409).json({
      error: "name already in phonebook",
    });
  }

  person.id = Math.floor(Math.random() * 100000);

  persons = persons.concat(person);

  res.json(person);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
