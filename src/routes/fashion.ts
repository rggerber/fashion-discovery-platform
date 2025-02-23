import express from "express";
import prisma from "../db";
import { authenticateUser } from "../middleware/authMiddleware";

const router = express.Router();

// GET all fashion items (Public)
router.get("/", async (req, res): Promise<void> => {
  try {
    const items = await prisma.fashionItem.findMany();
    res.json(items);
    return;
  } catch (error) {
    res.status(500).json({ error: "Error fetching items" });
    return;
  }
});

// POST Add a new fashion item (Protected)
router.post("/", authenticateUser, async (req, res): Promise<void> => {
  try {
    const { name, brand, category, imageUrl } = req.body;
    const newItem = await prisma.fashionItem.create({
      data: { name, brand, category, imageUrl },
    });
    res.json(newItem);
    return;
  } catch (error) {
    res.status(500).json({ error: "Error adding item" });
    return;
  }
});

// Update a fashion item (Protected)
router.put("/:id", authenticateUser, async (req, res): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, brand, category, imageUrl } = req.body;
      const updatedItem = await prisma.fashionItem.update({
        where: { id },
        data: { name, brand, category, imageUrl },
      });
      res.json(updatedItem);
    } catch (error) {
      res.status(500).json({ error: "Error updating item" });
    }
  });

// Delete a fashion item (Protected)
router.delete("/:id", authenticateUser, async (req, res): Promise<void> => {
  try {
    await prisma.fashionItem.delete({ where: { id: req.params.id } });
    res.json({ message: "Item deleted" });
    return;
  } catch (error) {
    res.status(404).json({ error: "Item not found or already deleted" });
    return;
  }
});

export default router;