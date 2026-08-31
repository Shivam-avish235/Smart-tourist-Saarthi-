import express from "express";
import * as incidentController from "../controllers/incidentController.js";

const router = express.Router();

// Create new incident
router.post("/", incidentController.createIncident);

// Get all incidents
router.get("/", incidentController.getIncidents);

// Get incident by ID
router.get("/:id", incidentController.getIncidentById);

// Update incident
router.put("/:id", incidentController.updateIncident);

// Delete incident
router.delete("/:id", incidentController.deleteIncident);

export default router;
