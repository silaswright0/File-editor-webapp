from flask import Flask, send_from_directory, jsonify, request
import os

app = Flask(__name__, static_folder='frontend')
STORAGE_DIR = "./storage"

@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS"
    return response

@app.route("/")
def home():
    return send_from_directory('frontend','index.html')


@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('frontend',path)


@app.route('/api/pdf/upload', methods=['POST'])
def upload_pdf():

    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200

    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'empty filename'}), 400
    safe_filename = os.path.basename(file.filename).replace("..","")
    destination_path = os.path.join(STORAGE_DIR,safe_filename)

    file_binary_data = file.read()
    with open(destination_path, "wb") as f:
        f.write(file_binary_data)

    return jsonify({
        'message': 'File uploaded successfully',
        'filename': file.filename
    })


if __name__ == '__main__':
    os.makedirs(STORAGE_DIR, exist_ok=True)
    app.run(debug=True,port=5000)