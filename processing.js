var model;

async function loadModel() {
  model = await tf.loadGraphModel("TFJS/model.json");
}

function predictImage() {
  // console.log("processing...");

  let image = cv.imread(canvas);
  cv.cvtColor(image, image, cv.COLOR_RGBA2GRAY, 0);
  cv.threshold(image, image, 175, 255, cv.THRESH_BINARY);

  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();
  cv.findContours(
    image,
    contours,
    hierarchy,
    cv.RETR_CCOMP,
    cv.CHAIN_APPROX_SIMPLE
  );

  let cnt = contours.get(0);
  let rect = cv.boundingRect(cnt);
  image = image.roi(rect);

  var height = image.rows;
  var width = image.cols;

  const ratio = width / height;

  if (ratio > 1) {
    width = 20;
    height = Math.round(20 / ratio);
  } else {
    width = Math.round(20 * ratio);
    height = 20;
  }

  let dsize = new cv.Size(width, height);

  // console.log(dsize);

  cv.resize(image, image, dsize, 0, 0, cv.INTER_AREA);

  const LEFT = Math.ceil(4 + (20 - width) / 2);
  const RIGHT = Math.floor(4 + (20 - width) / 2);
  const TOP = Math.ceil(4 + (20 - height) / 2);
  const BOTTOM = Math.floor(4 + (20 - height) / 2);

  // console.log(`top: ${TOP}, bottom: ${BOTTOM}, left: ${LEFT}, right: ${RIGHT}`);

  const BLACK = new cv.Scalar(0, 0, 0, 0);
  constant = cv.copyMakeBorder(
    image,
    image,
    TOP,
    BOTTOM,
    LEFT,
    RIGHT,
    cv.BORDER_CONSTANT,
    (value = BLACK)
  );

  // Centre of Mass
  cv.findContours(
    image,
    contours,
    hierarchy,
    cv.RETR_CCOMP,
    cv.CHAIN_APPROX_SIMPLE
  );
  cnt = contours.get(0);
  const Moments = cv.moments(cnt, false);

  const cx = Moments.m10 / Moments.m00;
  const cy = Moments.m01 / Moments.m00;
  // console.log(`M00: ${Moments.m00}, cx: ${cx}, cy: ${cy}`);

  const X_SHIFT = Math.round(image.cols / 2.0 - cx);
  const Y_SHIFT = Math.round(image.rows / 2.0 - cy);

  dsize = new cv.Size(image.cols, image.rows);
  const M = cv.matFromArray(2, 3, cv.CV_64FC1, [1, 0, X_SHIFT, 0, 1, Y_SHIFT]);
  cv.warpAffine(
    image,
    image,
    M,
    dsize,
    cv.INTER_LINEAR,
    cv.BORDER_CONSTANT,
    BLACK
  );

  let pixelValues = Float32Array.from(image.data);

  pixelValues = pixelValues.map(function (n) {
    return n / 255.0;
  });
  // console.log(`pixel values: ${pixelValues}`);

  const X = tf.tensor([pixelValues]);
  // console.log(`Shape of Tensor: ${X.shape}`);
  // console.log(`dtype of Tensor: ${X.dtype}`);

  const result = model.predict(X);
  result.print();

  const output = result.dataSync()[0];

  // Testing Only (delete later)
  // const outputCanvas = document.createElement("CANVAS");
  // cv.imshow(outputCanvas, image);

  // document.body.appendChild(outputCanvas);

  // Cleanup
  image.delete();
  contours.delete();
  cnt.delete();
  hierarchy.delete();
  M.delete();
  X.dispose();
  result.dispose();

  return output;
}
