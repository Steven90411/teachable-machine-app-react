import React, { useState } from "react";
import * as tmImage from "@teachablemachine/image";

const TeachableMachineComponent = () => {
  const URL = "./my_model/";

  const [model, setModel] = useState(null);
  const [labelContainer, setLabelContainer] = useState([]);
  const [maxPredictions, setMaxPredictions] = useState(0);
  const [imageData, setImageData] = useState(null);

  // 加載模型
  const loadModel = async () => {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // 加載模型和 metadata
    const loadedModel = await tmImage.load(modelURL, metadataURL);
    setModel(loadedModel);
    setMaxPredictions(loadedModel.getTotalClasses());
  };

  // 當選擇圖片時觸發的處理函式
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageData(reader.result); // 將讀取的圖片資料存入 state
      };
      reader.readAsDataURL(file);
    }
  };

  // 預測上傳的圖片
  const predict = async () => {
    if (!model || !imageData) return;

    // 創建一個 img 元素來顯示圖片並進行推論
    const img = new Image();
    img.src = imageData;
    img.onload = async () => {
      const prediction = await model.predict(img);
      const predictionData = prediction.map((pred) => ({
        className: pred.className,
        probability: pred.probability.toFixed(2),
      }));

      // 發送 POST 請求
      try {
        // const response = await fetch("https://httpbin.org/post", {
            const response = await fetch("http://localhost:8080/api/post", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(predictionData),
        });

        const result = await response.json();
        console.log("Server response:", result);
      } catch (error) {
        console.error("Error sending data:", error);
      }

      // 更新 UI 顯示結果
      const updatedLabels = prediction.map(
        (pred) => `${pred.className}: ${pred.probability.toFixed(2)}`
      );
      setLabelContainer(updatedLabels);
    };
  };

  return (
    <div>
      <h1>Teachable Machine Image Model</h1>
      <button type="button" onClick={loadModel}>
        Load Model
      </button>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      {imageData && (
        <div>
          <img src={imageData} alt="Uploaded" width="200" height="200" />
          <button type="button" onClick={predict}>
            Predict
          </button>
        </div>
      )}
      <div id="label-container">
        {labelContainer.map((label, index) => (
          <div key={index}>{label}</div>
        ))}
      </div>
      <div>
        {}
      </div>
    </div>
  );
};

export default TeachableMachineComponent;
