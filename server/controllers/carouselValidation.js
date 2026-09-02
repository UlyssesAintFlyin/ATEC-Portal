const { z } = require("zod");
 
const createCarouselSchema = z.object({
  caoursel_title: z.string().min(1, "Title is required").max(50),
  caoursel_description: z.string().min(1, "Description is required").max(250),
});
 
const updateCarouselSchema = createCarouselSchema.partial();
 
module.exports = { createCarouselSchema, updateCarouselSchema };