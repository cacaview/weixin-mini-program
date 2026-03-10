from flask import Flask, request, jsonify
import os
import json

app = Flask(__name__)
COUNTER_FILE = 'counter.json'

# simple persistent-ish counter (file-backed). In serverless this is best-effort.
counter = {'count': 0}


def load_counter():
    global counter
    try:
        if os.path.exists(COUNTER_FILE):
            with open(COUNTER_FILE, 'r', encoding='utf-8') as f:
                counter = json.load(f)
    except Exception:
        counter = {'count': 0}


def save_counter():
    try:
        with open(COUNTER_FILE, 'w', encoding='utf-8') as f:
            json.dump(counter, f)
    except Exception:
        pass


# 在模块导入时加载计数文件，避免在某些运行环境（如用 gunicorn 导入时）使用生命周期装饰器导致问题
load_counter()


@app.route('/api/count', methods=['POST'])
def api_count():
    svc = request.headers.get('X-WX-SERVICE') or request.headers.get('x-wx-service')
    body = request.get_json(silent=True) or {}
    action = body.get('action')

    if action == 'inc':
        counter['count'] = counter.get('count', 0) + 1
        save_counter()
    elif action == 'dec':
        counter['count'] = counter.get('count', 0) - 1
        save_counter()
    elif action == 'get' or action is None:
        pass
    else:
        return jsonify({'error': 'unknown action'}), 400

    return jsonify({'service': svc, 'count': counter.get('count', 0)})


@app.route('/health', methods=['GET'])
def health():
    return 'ok', 200


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port)
