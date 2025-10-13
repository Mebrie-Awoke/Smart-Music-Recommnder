from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import r2_score, mean_squared_error
import numpy as np
import os

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)
try:
    df = pd.read_csv("tcc_ceds_music.csv")    
    features = [
        "danceability", "loudness", "acousticness",
        "instrumentalness", "valence", "energy",
        "sadness", "feelings"
    ]

    missing_columns = [col for col in features + ["age"] if col not in df.columns]
    if missing_columns:
        for col in missing_columns:
            if col != "age":
                df[col] = 0.5  
            else:
                df[col] = 25   
    
    original_size = len(df)
    df = df.dropna(subset=features + ["age"])
    if len(df) < original_size:
        print(f"Dropped {original_size - len(df)} rows due to missing values.")
    
    for feature in features + ["age"]:
        df[feature] = pd.to_numeric(df[feature], errors='coerce')
    
    df = df.dropna(subset=features + ["age"])
    print(f"Final dataset size: {len(df)} rows")
    
except FileNotFoundError:
    print("Error: Dataset file 'tcc_ceds_music.csv' not found.")
    print("Creating dummy data for demonstration...")
    np.random.seed(42)
    df = pd.DataFrame({
        'artist_name': ['Artist ' + str(i) for i in range(100)],
        'track_name': ['Track ' + str(i) for i in range(100)],
        'genre': ['Pop', 'Rock', 'Jazz', 'Classical', 'Hip-Hop'] * 20,
        'danceability': np.random.uniform(0, 1, 100),
        'loudness': np.random.uniform(0, 1, 100),
        'acousticness': np.random.uniform(0, 1, 100),
        'instrumentalness': np.random.uniform(0, 1, 100),
        'valence': np.random.uniform(0, 1, 100),
        'energy': np.random.uniform(0, 1, 100),
        'sadness': np.random.uniform(0, 1, 100),
        'feelings': np.random.uniform(0, 1, 100),
        'age': np.random.randint(15, 60, 100)
    })
    features = ["danceability", "loudness", "acousticness", "instrumentalness", 
                "valence", "energy", "sadness", "feelings"]
scaler = StandardScaler()
X = df[features]
X_scaled = scaler.fit_transform(X)
y = df["age"]

X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)
model = LinearRegression()
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
model_r2 = r2_score(y_test, y_pred)
model_mse = mean_squared_error(y_test, y_pred)

print(f"Model trained - R² Score: {model_r2:.3f}, MSE: {model_mse:.3f}")

def recommend_songs(user_features, top_n=5):
    user_pred = model.predict([user_features])[0]
    df["predicted_score"] = model.predict(X_scaled)
    df["distance"] = abs(df["predicted_score"] - user_pred)
    
    recs = df.sort_values("distance").head(top_n)[
        ["artist_name", "track_name", "genre", "predicted_score"]
    ]
    
    return recs.to_dict('records')
@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')
@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('.', filename)

@app.route('/api/')
def api_home():
    return jsonify({"message": "Music Recommendation API is running!"})

@app.route('/api/recommend', methods=['POST'])
def recommend():
    try:
        data = request.get_json()
        user_features = data.get('features', [])
        
        if len(user_features) != len(features):
            return jsonify({"error": f"Expected {len(features)} features, got {len(user_features)}"}), 400
        for i, value in enumerate(user_features):
            if value < 0 or value > 1:
                return jsonify({"error": f"Feature {features[i]} must be between 0 and 1"}), 400
        
        recommendations = recommend_songs(user_features, top_n=8)
        
        return jsonify({
            "recommendations": recommendations,
            "model_r2": round(model_r2, 3),
            "model_mse": round(model_mse, 3)
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/model_info')
def model_info():
    return jsonify({
        "r2_score": round(model_r2, 3),
        "mse": round(model_mse, 3),
        "features": features
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)