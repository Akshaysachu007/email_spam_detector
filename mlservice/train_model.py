import pandas as pd
import pickle
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score


data = pd.read_csv(
    "./datasets/emails.csv", 
    engine='python', 
    on_bad_lines='skip', 
    encoding='utf-8'
)


data ["Subject"] = data ["Subject"].fillna ("")
data ["Message"] = data ["Message"].fillna ("")

data ["Text"] = data ["Subject"] + " " + data ["Message"]

data["label"] = data["Spam/Ham"].map({"spam":1, "ham":0})

data = data.dropna(subset=["label"])
data = data[data["Text"].str.len() > 20]

X = data["Text"]
Y = data["label"]

vectorizer = TfidfVectorizer(stop_words="english", max_features=5000)

X_vec = vectorizer.fit_transform(X)

X_train,X_test,Y_train,Y_test = train_test_split(X_vec,Y,test_size=0.2,random_state=42)


model = LogisticRegression(max_iter=1000)

model.fit(X_train,Y_train)

predictions = model.predict(X_test)
accuracy = accuracy_score(Y_test,predictions)

print(f"Model Accuracy: {accuracy*100:.4f}%")


with open ("trained_model.pkl", "wb") as f:
    pickle.dump(model, f)
    
with open ("vectorizer.pkl", "wb") as f:
    pickle.dump(vectorizer, f)    
    
print("Model and vectorizer saved successfully.")    