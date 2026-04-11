const express = require("express");
const app = express();

app.get("/.well-known/apple-app-site-association", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send({
    applinks: {
      details: [
        {
          appIDs: ["XBA426A4GB.gg.FleetCycle"],
          paths: ["/demo/*"],
        },
      ],
    },
  });
});

app.get("/demo/test", (req, res) => {
  res.send("Demo page");
});

app.listen(3000, () => console.log("Running on 3000"));

// const express = require('express');
// const app = express();

// app.get('/.well-known/apple-app-site-association', (req, res) => {
//   res.setHeader('Content-Type', 'application/json');
//   res.send({
//     applinks: {
//       details: [
//         {
//           appIDs: ['XBA426A4GB.com.aa.techopsmobility.atom.emx.app'],
//           paths: ['/demo/*'],
//         },
//       ],
//     },
//   });
// });

// app.get('/demo/test', (req, res) => {
//   res.send('Demo page');
// });

// app.listen(3000, () => console.log('Running on 3000'));
