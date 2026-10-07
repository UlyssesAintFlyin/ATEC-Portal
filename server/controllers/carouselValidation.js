const { z } = require("zod");
 
const createCarouselSchema = z.object({
  carousel_title: z.string().min(1, "Title is required").max(50),
  carousel_description: z.string().min(1, "Description is required").max(250),
});
 
const updateCarouselSchema = createCarouselSchema.partial();
 
module.exports = { createCarouselSchema, updateCarouselSchema };