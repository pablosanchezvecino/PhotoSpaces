exports.upload = async (image) => {
  console.log(image);

  return { eh: "eh" };

  throw new Error(
    "Bad request when uploading the image, please select a valid image."
  );
};
