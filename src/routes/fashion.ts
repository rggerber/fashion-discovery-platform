import express from "express";
import prisma from "../db";
import { authenticateUser } from "../middleware/authMiddleware";
import redisClient from "../redisClient";

const router = express.Router();

// GET all fashion items (Public) with pagination and caching
router.get("/", async (req, res): Promise<void> => {
  try {
    // Parse query params defaulting to page 1 and limit 10
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Create unique cache key with pagination params
    const cacheKey = `fashionItems: page=${page}:limit=${limit}`;

    // Attempt to retrieve cached data from Redis
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
        console.log("Returning cached data");
        res.json(JSON.parse(cachedData));
        return;
    }

    // If no cache, query a subset of items based on Prisma's skip and take
    const items = await prisma.fashionItem.findMany({
      skip: skip,
      take: limit,
    });

    // Calculate total pages for metadata
    const totalItems = await prisma.fashionItem.count();
    const totalPages = Math.ceil(totalItems / limit);

    // Construct result object with pagination metadata and the items
    const result = {
      page,
      limit,
      totalItems,
      totalPages,
      items,
    };

    // Cache the result in Redis with an 60 sec expiration time
    await redisClient.set(cacheKey, JSON.stringify(result), { EX: 60 });

    // Return result back to client
    res.json(result);

  } catch (error) {
    console.error("Error fetching items:", error);
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