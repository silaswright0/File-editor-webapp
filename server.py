from flask import Flask, send_from_directory, jsonify, request
import os

app = Flask(__name__, static_folder='frontend')

@app.route("/")
def home():
    return send_from_directory('frontend','index.html')


@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('frontend',path)


@app.route('/api/pdf/upload', methods=['POST'])
def upload_pdf():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']

    return jsonify({
        'message': 'File uploaded successfully',
        'filename': file.filename
    })


if __name__ == '__main__':
    app.run(debug=True,port=5000)