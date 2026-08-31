import Incident from "../models/Incidents.js";

// Create new incident
export const createIncident = async (req, res) => {
  try {
    const incident = new Incident(req.body);
    await incident.save();
    res.status(201).json({ message: "Incident created", incident });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all incidents
export const getIncidents = async (req, res) => {
  try {
    const { status, severity, touristId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    if (touristId) filter.touristId = touristId;

    const incidents = await Incident.find(filter).sort({ createdAt: -1 });
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get incident by ID
export const getIncidentById = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);
    if (!incident) return res.status(404).json({ error: "Incident not found" });
    res.json(incident);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update incident
export const updateIncident = async (req, res) => {
  try {
    const updated = await Incident.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: "Incident not found" });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete incident
export const deleteIncident = async (req, res) => {
  try {
    const deleted = await Incident.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Incident not found" });
    res.json({ message: "Incident deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
