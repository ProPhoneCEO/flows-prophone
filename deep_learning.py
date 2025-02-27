import tensorflow as tf
from tensorflow import keras
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import pandas as pd
import numpy as np
import joblib

# Load the dataset
file_path = "/content/sample_data/updated_pumpkin_okra_groundmelon_dataset.csv"  # Update with your file path
df = pd.read_csv(file_path)

# Generate a synthetic "Area" feature based on yield with some variation
np.random.seed(42)
df["Area (sq meters)"] = df["Yield (kg)"] / np.random.uniform(1.5, 2.5, size=len(df))

# Select features and target variable
X = df[["Temperature (°C)", "Humidity (%)", "Rainfall (mm)", "Soil pH", "NPK Levels", "Area (sq meters)"]]
y = df["Yield (kg)"]

# Split the dataset into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Standardize the features
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Save the scaler for future use
joblib.dump(scaler, "scaler.pkl")

# Build a simple regression ANN model
model = Sequential([
    Dense(64, activation='relu', input_shape=(X_train_scaled.shape[1],)),
    Dense(32, activation='relu'),
    Dense(1)  # Output layer with one neuron for regression
])

# Compile the model
model.compile(optimizer='adam', loss='mse', metrics=['mae'])

# Train the model
history = model.fit(X_train_scaled, y_train, epochs=100, batch_size=16, validation_data=(X_test_scaled, y_test), verbose=1)

# Evaluate the model
test_loss, test_mae = model.evaluate(X_test_scaled, y_test, verbose=1)
print(f"Test Loss: {test_loss:.4f}, Test MAE: {test_mae:.4f}")

# Save the trained model
model.save("crop_yield_ann_model.h5")
print("Model saved successfully!")

# --- Make Predictions on New Values ---
# Define new input values (example)
new_data = pd.DataFrame({
    "Temperature (°C)": [25.0, 30.0],
    "Humidity (%)": [60.0, 70.0],
    "Rainfall (mm)": [150.0, 200.0],
    "Soil pH": [6.5, 5.8],
    "NPK Levels": [100, 120],
    "Area (sq meters)": [800, 1100]
})

# Load the scaler and transform new input data
scaler = joblib.load("scaler.pkl")
new_data_scaled = scaler.transform(new_data)

# Load the trained model
model = keras.models.load_model("crop_yield_ann_model.h5", custom_objects={'mse': tf.keras.losses.MeanSquaredError()})

# Predict the yield
predictions = model.predict(new_data_scaled)
new_data["Predicted Yield (kg)"] = predictions

print("\nPredictions on new data:")
print(new_data)
