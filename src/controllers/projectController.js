const Project = require("../models/Project");
const Board = require("../models/Board");
const User = require("../models/User");
const Task = require("../models/Task");

const updateUserRevenue = async (userId) => {
  const projects = await Project.find({
    owner: userId,
    status: { $ne: "deleted" },
  });
  let total = 0;
  let received = 0;

  projects.forEach((p) => {
    total += p.price || 0;
    received += p.paidAmount || 0;
  });

  await User.findByIdAndUpdate(userId, {
    totalRevenue: total,
    receivedRevenue: received,
    remainingRevenue: total - received,
  });
};

exports.createProject = async (req, res) => {
  try {
    const project = await Project.create({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price || 0,
      paidAmount: req.body.paidAmount || 0,
      category: req.body.category || "Other",
      deadline: req.body.deadline,
      owner: req.user._id,
      members: [{ user: req.user._id, role: "admin" }],
    });

    // Update user revenue stats
    await updateUserRevenue(req.user._id);

    // Create a default board for the project
    await Board.create({
      name: "Main Board",
      project: project._id,
      columns: [
        { title: "To Do", order: 1 },
        { title: "In Progress", order: 2 },
        { title: "Done", order: 3 },
      ],
    });

    res.status(201).json({ status: "success", data: { project } });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      "members.user": req.user._id,
      status: "active",
    }).populate("owner", "name email avatar");

    if (!projects || projects.length === 0) {
      return res.status(200).json({
        status: "success",
        results: 0,
        data: { projects: [] },
      });
    }

    // Add task counts for each project
    const allTasks = await Task.find({
      project: { $in: projects.map((p) => p._id) },
    }).select("project status");

    const projectsWithStats = projects.map((project) => {
      const projectObj = project.toObject();
      const projectTasks = allTasks.filter(
        (t) => t.project.toString() === project._id.toString(),
      );

      projectObj.totalTasks = projectTasks.length;
      projectObj.completedTasks = projectTasks.filter(
        (t) => t.status === "done",
      ).length;

      return projectObj;
    });

    res.status(200).json({
      status: "success",
      results: projectsWithStats.length,
      data: { projects: projectsWithStats },
    });
  } catch (err) {
    console.error("GET ALL PROJECTS ERROR:", err);
    res.status(400).json({ status: "fail", message: err.message });
  }
};

exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("members.user", "name email avatar")
      .populate("owner", "name email avatar");

    if (!project) return res.status(404).json({ message: "Project not found" });

    const tasks = await Task.find({ project: project._id }).select("status");
    const projectObj = project.toObject();
    projectObj.totalTasks = tasks.length;
    projectObj.completedTasks = tasks.filter((t) => t.status === "done").length;

    res.status(200).json({ status: "success", data: { project: projectObj } });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar");

    if (!project) return res.status(404).json({ message: "Project not found" });

    // Update revenue stats if price or paidAmount changed
    if (req.body.price !== undefined || req.body.paidAmount !== undefined) {
      await updateUserRevenue(project.owner);
    }

    res.status(200).json({ status: "success", data: { project } });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, {
      status: "deleted",
    });

    if (!project) return res.status(404).json({ message: "Project not found" });

    await updateUserRevenue(project.owner);

    res.status(204).json({ status: "success", data: null });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

exports.addMilestone = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.milestones.push({ text: req.body.text });
    await project.save();

    res.status(200).json({ status: "success", data: { project } });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

exports.updateMilestone = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const milestone = project.milestones.id(req.params.milestoneId);
    if (!milestone)
      return res.status(404).json({ message: "Milestone not found" });

    if (req.body.completed !== undefined)
      milestone.completed = req.body.completed;
    if (req.body.text) milestone.text = req.body.text;

    await project.save();

    res.status(200).json({ status: "success", data: { project } });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

exports.addAttachment = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "Please upload a file" });

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const attachment = {
      name: req.file.originalname,
      url: `http://localhost:5000/attachments/${req.file.filename}`,
      fileType: req.file.mimetype,
      uploadedBy: req.user._id,
    };

    project.attachments.push(attachment);
    await project.save();

    res.status(200).json({ status: "success", data: { project } });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};
