import express from "express";
import prisma from "../db";
import { authenticateUser } from "../middleware/authMiddleware";

const router = express.Router();

// GET all fashion items (Public) with pagination
router.get("/", async (req, res): Promise<void> => {
  try {
    // Parse query params defaulting to page 1 and limit 10
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Fetch paginated items using Prisma's skip and take
    const items = await prisma.fashionItem.findMany({
      skip: skip,
      take: limit,
    });

    const totalItems = await prisma.fashionItem.count();
    const totalPages = Math.ceil(totalItems / limit);

    // Return pagination metadata and the items
    res.json({
      page,
      limit,
      totalItems,
      totalPages,
      items,
    });
    } catch (error) {
      res.status(500).json({ error: "Error fetching items" });
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
  } catch (error) {
    res.status(500).json({ error: "Error adding item" });
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
  } catch (error) {
    res.status(404).json({ error: "Item not found or already deleted" });
  }
});

export default router;