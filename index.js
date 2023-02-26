require("dotenv").config();
const express = require("express");
var morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person");
const { default: mongoose } = require("mongoose");

const app = express();

// Middleware:
app.use(
  morgan("tiny", {
    skip: function (req, res) {
      return req.method == "POST";
    },
  })
);
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

// Routes
app.get("/api/persons", (req, res) => {
  Person.find({})
    .then((result) => {
      res.json(result);
    })
    .catch((error) => next(error));
});

app.get("/info", (req, res) => {
  const date = new Date().toUTCString();
  Person.find({})
    .then((result) => {
      res.json(`Phonebook has info for ${result.length} people ${date}`);
    })
    .catch((error) => next(error));
});

app.get("/api/persons/:id", (req, res, next) => {
  const id = req.params.id;
  Person.findById(id)
    .then((p) => {
      if (p) {
        res.json(p);
      } else {
        res.status(404).send(`No person found for id: ${id}`);
      }
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then((person) => {
      res.status(204).end();
    })
    .catch((error) => next(error));
});

app.post("/api/persons", (req, res, next) => {
  const body = req.body;

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  Person.findOne({ name: body.name })
    .then((p) => {
      if (p) {
        res.status(409).json({
          error: "name already in phonebook",
        });
      } else {
        person
          .save()
          .then((updatedPerson) => {
            res.json(updatedPerson);
          })
          .catch((error) => next(error));
      }
    })
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (req, res, next) => {
  const { name, number } = req.body;
  const id = req.params.id;

  Person.findByIdAndUpdate(
    id,
    { name, number },
    { new: true, runValidators: true, context: "query" }
  )
    .then((updatedPerson) => {
      if (updatedPerson) {
        res.json(updatedPerson);
      } else {
        res.status(404).send(`No person found for id: ${id}`);
      }
    })
    .catch((error) => next(error));
});

// Use errorHandlers
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

const errorHandler = (error, request, response, next) => {
  if (error.name === "CastError") {
    return response.status(400).send({ error: "Bad request: invalid request" });
  } else if (error.name === "SyntaxError") {
    return response.status(400).send({ error: "Bad request: invalid request" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  } else if (error instanceof mongoose.Error) {
    return response.status(500).send("Internal server error");
  }

  next(error);
};

app.use(unknownEndpoint);

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
