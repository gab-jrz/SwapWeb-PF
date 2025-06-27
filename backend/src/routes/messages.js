import express from "express";
import Message from "../models/Message.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
const router = express.Router();

// Obtener cantidad de mensajes no leídos para un usuario
router.get("/unread/:userId", async (req, res) => {
  try {
    const total = await Message.countDocuments({
      paraId: req.params.userId,
      leidoPor: { $ne: req.params.userId },
    });
    res.json({ total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Marcar mensajes como leídos para un usuario
router.put("/mark-read/:userId", async (req, res) => {
  try {
    await Message.updateMany(
      {
        paraId: req.params.userId,
        leidoPor: { $ne: req.params.userId },
      },
      { $push: { leidoPor: req.params.userId } }
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get messages for a user
router.get("/:userId", async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ paraId: req.params.userId }, { deId: req.params.userId }],
    })
      .select("-__v")
      .sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new message
router.post("/", async (req, res) => {
  const message = new Message({
    de: req.body.de,
    deId: req.body.deId,
    paraId: req.body.paraId,
    paraNombre: req.body.paraNombre,
    productoId: req.body.productoId,
    productoTitle: req.body.productoTitle,
    productoOfrecido: req.body.productoOfrecido,
    descripcion: req.body.descripcion,
    condiciones: req.body.condiciones,
    imagenNombre: req.body.imagenNombre,
    leidoPor: [req.body.deId],
  });

  try {
    const newMessage = await message.save();
    const messageResponse = newMessage.toObject();
    delete messageResponse.__v;
    res.status(201).json(messageResponse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Confirm exchange by a user
router.put("/:id/confirm", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "userId requerido" });

    const message = await Message.findById(req.params.id);
    if (!message)
      return res.status(404).json({ message: "Mensaje no encontrado" });

    if (!message.confirmaciones.includes(userId)) {
      message.confirmaciones.push(userId);
    }

    let completed = false;
    // cuando confirmen ambas partes
    if (message.confirmaciones.length >= 2 && !message.completed) {
      message.completed = true;
      completed = true;

      // Marcar productos como intercambiados
      await Product.updateOne(
        { id: message.productoId },
        { intercambiado: true }
      );
      // Agregar transacción detallada a ambos usuarios
      const fecha = new Date();
      const transDe = {
        productoSolicitado: message.productoTitle,
        productoSolicitadoId: message.productoId,
        productoOfrecido: message.productoOfrecido,
        productoOfrecidoId: message.productoOfrecidoId,
        fecha,
        otroUserId: message.paraId,
        otroUserNombre: message.paraNombre || "",
      };
      const transPara = {
        productoSolicitado: message.productoOfrecido,
        productoSolicitadoId: message.productoOfrecidoId,
        productoOfrecido: message.productoTitle,
        productoOfrecidoId: message.productoId,
        fecha,
        otroUserId: message.deId,
        otroUserNombre: message.de || "",
      };
      await User.updateOne(
        { id: message.deId },
        { $push: { transacciones: transDe } }
      );
      await User.updateOne(
        { id: message.paraId },
        { $push: { transacciones: transPara } }
      );

      // Crear mensaje system
      const sysMsg = new Message({
        de: "system",
        deId: "system",
        paraId: message.deId,
        paraNombre: "system",
        productoId: message.productoId,
        productoTitle: message.productoTitle,
        productoOfrecido: message.productoOfrecido,
        descripcion: `Producto intercambiado entre usuarios. ¡Califiquen!`,
        system: true,
      });
      await sysMsg.save();
    }

    await message.save();
    res.json({ confirmed: true, completed });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update rating on a message y guardarlo en usuario receptor
router.put("/:id/rating", async (req, res) => {
  try {
    const { rating, raterId } = req.body;
    if (!rating || !raterId)
      return res.status(400).json({ message: "rating y raterId requeridos" });

    const message = await Message.findById(req.params.id);
    if (!message)
      return res.status(404).json({ message: "Mensaje no encontrado" });
    message.rating = rating;
    await message.save();

    // guardar en historial del usuario receptor
    const receptorId = message.deId === raterId ? message.paraId : message.deId;
    const raterUser = await User.findOne({ id: raterId });
    const receptor = await User.findOne({ id: receptorId });
    if (receptor) {
      receptor.calificaciones = receptor.calificaciones || [];
      receptor.calificaciones.push({
        deId: raterId,
        deNombre: `${raterUser?.nombre || ""} ${
          raterUser?.apellido || ""
        }`.trim(),
        rating,
        productoSolicitado: message.productoTitle,
        productoOfrecido: message.productoOfrecido,
      });
      // promedio
      const sum = receptor.calificaciones.reduce(
        (acc, c) => acc + (c.rating || 0),
        0
      );
      receptor.calificacion = (sum / receptor.calificaciones.length).toFixed(1);
      await receptor.save();
    }

    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
