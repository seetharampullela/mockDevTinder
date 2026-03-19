# APIs

Auth Router

- POST /signup
- POST /login
- POST /logout

Profile Router

- GET /profile/view
- PATCH /profile/edit
- PATCH /profile/password

Connection Request Router

- POST /requested/send/interested/:userId
- POST /requested/send/ignored/:userId
- POST /requested/review/accepted/:requestId
- POST /requested/review/rejected/:requestId

Status: Interested, Ignored, Accepted, Rejected

User Router

- GET /user/connections
- GET /user/requests/received
- GET /user/feed
