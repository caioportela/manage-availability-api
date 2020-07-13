# manage-availability-api

In order to allow professionals to manage their availability they need a system that manages slots of time

## Table of Contents

<!-- toc -->
- [Installation](#installation)
- [Usage](#usage)
  - [List all professionals](#get-professionals)
  - [List all professional slots in a range of time](#get-sessions)
  - [List all slots available in a range of time](#get-sessionsavailable)
  - [Set professional availability](#post-sessions)
  - [Book a session](#put-sessionsidschedule)
  - [Find a specific professional](#get-professionalsid)
  - [Find a specific slot](#get-sessionsid)
  - [Add a professional](#post-professionals)
  - [Remove a professional](#delete-professionalsid)
  - [Remove session](#delete-sessionsid)
  - [Authentication](#post-login)
- [Test](#test)
<!-- tocstop -->

## Installation

```bash
$ git clone https://github.com/caioportela/manage-availability-api.git
$ cd manage-availability-api
$ npm install
```

## Usage

To run the application, execute
```bash
$ npm start
```
or
```bash
$ node app.js
```

The application is now running at `http://localhost3000`

In this documentation all requests will be made through cURL
but also it can be done by using [Postman](https://www.postman.com/)

-------------------------------------------------------------------------------

### `GET /professionals`
A list of all professionals can be retrieved with `GET /professionals`

- Request
  ```bash
  $ curl http://localhost:3000/professionals
  ```

- Response
  ```json
  {
    "professionals": [
      {
        "id": 1,
        "firstName": "Erica",
        "lastName": "Sargent"
      },
      {
        "id": 2,
        "firstName": "Rahma",
        "lastName": "Peralta"
      }
    ]
  }
  ```

-------------------------------------------------------------------------------

### `GET /sessions`
A list with all professional slots in a range of time can be retrieved with `GET /sessions`.

The time range must be sent along the url as query params. If not informed, all professional
slots will be displayed.

- Parameters
  - `start`: `String` - in the format `YYYY-MM-DD HH:mm:ss`
  - `end`: `String` - in the format `YYYY-MM-DD HH:mm:ss`


- Request
  ```bash
  $ curl -X GET http://localhost:3000/sessions -G --data-urlencode 'start=2020-07-15 08:00:00' --data-urlencode 'end=2020-07-15 11:00:00'
  ```

- Response
  ```json
  {
    "sessions": [
      {
        "id": 2,
        "booked": false,
        "customer": null,
        "end": "2020-07-15T12:00:00.000Z",
        "start": "2020-07-15T11:30:00.000Z",
        "professional": 1
      },
      {
        "id": 3,
        "booked": false,
        "customer": null,
        "end": "2020-07-15T12:30:00.000Z",
        "start": "2020-07-15T12:00:00.000Z",
        "professional": 1
      }
    ]
  }
  ```

-------------------------------------------------------------------------------

### `GET /sessions/available`
A list with all slots available in a range of time can be retrieved with `GET /sessions/available`.

The time range must be sent along the url as query params. If not informed, all available
slots will be displayed.

Only slots that are available to be booked for 1 hour will be displayed.

Let's say a professional has the available slots for 8AM, 8:30AM and 9AM on the same day.
Only the first two (8AM, 8:30AM) will be displayed as available to be booked. If the 8:30AM slot
has been booked, then the 8AM session will not be available anymore because it's needed at least
1 hour for each session.

- Parameters
  - `start`: `String` - in the format `YYYY-MM-DD HH:mm:ss`
  - `end`: `String` - in the format `YYYY-MM-DD HH:mm:ss`

- Request
  ```bash
  $ curl -X GET http://localhost:3000/sessions/available -G --data-urlencode 'start=2020-07-15 08:00:00' --data-urlencode 'end=2020-07-15 11:00:00'
  ```

- Response
  ```json
  {
    "sessions": [
      {
        "id": 2,
        "booked": false,
        "customer": null,
        "end": "2020-07-15T12:00:00.000Z",
        "start": "2020-07-15T11:30:00.000Z",
        "professional": 1
      },
      {
        "id": 3,
        "booked": false,
        "customer": null,
        "end": "2020-07-15T12:30:00.000Z",
        "start": "2020-07-15T12:00:00.000Z",
        "professional": 1
      },
      {
        "id": 8,
        "booked": false,
        "customer": null,
        "end": "2020-07-15T12:00:00.000Z",
        "start": "2020-07-15T11:30:00.000Z",
        "professional": 2
      }
    ]
  }
  ```

-------------------------------------------------------------------------------

### `POST /sessions`
*This endpoint requires a token that can be generated using [`POST /login`](#post-login)*

For a session to be available, a professional must set in which days and the
interval of time. It can be done with `POST /sessions`

Only professionals can create sessions

- Headers
  - `Content-Type: application/json`
  - `Authorization: 'Bearer <token>'`

- Body
  ```json
  {
    "start": "2020-07-15 08:00:00",
    "end": "2020-07-15 11:30:00"
  }
  ```

- Request
  ```bash
  $ curl -X POST http://localhost:3000/sessions -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9mZXNzaW9uYWwiOnsiaWQiOjF9LCJpYXQiOjE1OTQ2NTIwMTh9.l1WJK4SceKXaEqtO-YE0caFvtw-S3ZxqK2-q1nxtMFE' -H 'Content-Type:application/json' -d '{"start":"2020-07-15 08:00:00","end":"2020-07-15 11:30:00"}'
  ```

-------------------------------------------------------------------------------

### `PUT /sessions/:id/schedule`
A customer can book sessions with `PUT /sessions/:id/schedule`

- Headers
  - `Content-Type: application/json`

- Body
  ```json
  {
    "customer": "Sara Wheatley"
  }
  ```

- Request
  ```bash
  $ curl -X PUT http://localhost:3000/sessions/2/schedule -H 'Content-Type:application/json' -d '{"customer": "Sara Wheatley"}'
  ```

-------------------------------------------------------------------------------

### `GET /professionals/:id`
A especific professional can be retrieved with `GET /professionals/:id`

- Request
  ```bash
  $ curl http://localhost:3000/professionals/1
  ```

- Response
  ```json
  {
    "professional": {
      "id": 1,
      "firstName": "Erica",
      "lastName": "Sargent"
    }
  }
  ```

-------------------------------------------------------------------------------

### `GET /sessions/:id`
A single slot can be retrieved with `GET /sessions/:id`

- Request
  ```bash
  $ curl  http://localhost:3000/sessions/3
  ```

- Response
  ```json
  {
    "session": {
      "id": 3,
      "booked": false,
      "customer": null,
      "end": "2020-07-15T12:30:00.000Z",
      "start": "2020-07-15T12:00:00.000Z",
      "professional": 1
    }
  }
  ```

-------------------------------------------------------------------------------

### `POST /professionals`

Professionals can be added via `POST /professionals`

- Headers
  - `Content-Type: application/json`

- Body
  ```json
  {
    "professional": {
      "firstName": "Kianna",
      "lastName": "Robson"
    }
  }
  ```

- Request
  ```bash
  $ curl -X POST http://localhost:3000/professionals -H 'Content-Type:application/json' -d '{"professional":{"firstName":"Kianna","lastName":"Robson"}}'
  ```

- Response

  ```json
  {
    "professional": {
      "id": 3,
      "firstName": "Kianna",
      "lastName": "Robson",
      "updatedAt": "2020-07-13T13:20:36.609Z",
      "createdAt": "2020-07-13T13:20:36.609Z"
    }
  }
  ```

-------------------------------------------------------------------------------

### `DELETE /professionals/:id`
A professional can be removed with `DELETE /professionals/:id`

- Request
  ```bash
  $ curl -X DELETE http://localhost3000/professionals/4
  ```

-------------------------------------------------------------------------------

### `DELETE /sessions/:id`
*This endpoint requires a token that can be generated using [`POST /login`](#post-login)*

A session can be removed with `DELETE /sessions/:id`

A session can only be removed by its creator

- Headers
  - `Authorization: 'Bearer <token>'`

- Request
  ```bash
  $ curl -X DELETE http://localhost:3000/sessions/1 -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9mZXNzaW9uYWwiOnsiaWQiOjF9LCJpYXQiOjE1OTQ2NTIwMTh9.l1WJK4SceKXaEqtO-YE0caFvtw-S3ZxqK2-q1nxtMFE'

  ```

-------------------------------------------------------------------------------

### `POST /login`
*This endpoint is for mocking an authentication*

The endpoints [`POST /sessions`](#post-sessions) and [`DELETE /sessions/:id`](#delete-sessionsid)
require for the professional to be authenticated in order to proceed with the operations.
The token for the authentication can be retrieved with `POST /login`

- Headers
  - `Content-Type: application/json`

- Request
  ```bash
  $ curl -X POST http://localhost:3000/login -H 'Content-Type:application/json' -d '{"professional":1}'
  ```

- Response
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9mZXNzaW9uYWwiOnsiaWQiOjF9LCJpYXQiOjE1OTQ2NTIwMTh9.l1WJK4SceKXaEqtO-YE0caFvtw-S3ZxqK2-q1nxtMFE"
  }
  ```

-------------------------------------------------------------------------------

## Test

To run tests simply run:
```bash
$ npm test
```

For coverage:
```bash
$ npm run coverage
```
