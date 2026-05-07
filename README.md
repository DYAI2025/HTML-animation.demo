# HTML Animation Demo

Single-file frontend animation lab for prompt-driven interface effects. The app now includes Railway-ready Node serving, dark/bright theming, multiple cursor systems, reduced-motion guardrails and performance-focused vanilla JavaScript.

## Run locally

```bash
npm start
```

Open <http://localhost:3000>.

## Test

```bash
npm test
```

## Railway deployment

Railway can deploy this repository as a Node service:

- Build command: not required
- Start command: `npm start`
- Port: provided by Railway through the `PORT` environment variable

The Node server serves `prompt_driven_interface_effect_lab_v2_single.html` at `/`.
