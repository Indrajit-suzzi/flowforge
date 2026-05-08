export const create = (Model) => async (req, res) => {
  try {
    req.body.tenantId = req.tenant;
    const data = await Model.create(req.body);
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAll = (Model) => async (req, res) => {
  try {
    const data = await Model.find({ tenantId: req.tenant });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getOne = (Model) => async (req, res) => {
  try {
    const data = await Model.findOne({ _id: req.params.id, tenantId: req.tenant });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const update = (Model) => async (req, res) => {
  try {
    const data = await Model.findOneAndUpdate({ _id: req.params.id, tenantId: req.tenant }, req.body, {
      new: true,
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const remove = (Model) => async (req, res) => {
  try {
    await Model.findOneAndDelete({ _id: req.params.id, tenantId: req.tenant });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
