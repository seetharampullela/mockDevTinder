# APIs

### Auth Router

- POST /signup
- POST /login
- POST /logout

### Profile Router

- GET /profile/view
- PATCH /profile/edit
- PATCH /profile/password

### Connection Request Router

- POST /request/send/:status/:toUserId
- POST /request/review/:status/:requestId

<!-- - POST /request/send/interested/:userId
- POST /request/send/ignored/:userId
- POST /request/review/accepted/:requestId
- POST /request/review/rejected/:requestId -->

Status: Interested, Ignored, Accepted, Rejected

### User Router

- GET /user/connections
- GET /user/requests/received
- GET /user/feed
