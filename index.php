<?php
header('Content-Type: text/html; charset=utf-8');

function checkWebsiteAvailability($url) {
    // Дадаем http:// калі пратакол не паказаны
    if (!preg_match("~^(?:f|ht)tps?://~i", $url) && !preg_match("~^http://~i", $url)) {
        $url = "http://" . $url;
    }
    
    // Прыбіраем прабелы
    $url = trim($url);
    
    // Правяраем даступнасць
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_NOBODY, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    
    // Дадатковыя опцыі для вырашэння праблем
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
    
    $result = curl_exec($ch);
    curl_close($ch);
    
    return $result !== false;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    header('Content-Type: application/json');
    $url = $_POST['url'] ?? '';
    echo json_encode(['ok' => checkWebsiteAvailability($url)]);
    exit;
}
?>
<!DOCTYPE html>
<html lang="be">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Праверка даступнасці сайта</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
</head>
<body>
    <div class="container py-5">
        <div class="row justify-content-center">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-body">
                        <h1 class="card-title text-center mb-4">Праверка даступнасці сайта</h1>
                        <form id="checkForm">
                            <div class="mb-3">
                                <label for="url" class="form-label">Увядзіце URL сайта:</label>
                                <input type="url" class="form-control" id="url" name="url" required placeholder="https://example.com">
                            </div>
                            <div class="d-grid">
                                <button type="submit" class="btn btn-primary" id="submitBtn">
                                    <span class="spinner-border spinner-border-sm d-none" role="status" aria-hidden="true" id="loadingSpinner"></span>
                                    <span id="buttonText">Праверыць</span>
                                </button>
                            </div>
                        </form>
                        <div id="result" class="mt-3"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        document.getElementById('checkForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const url = document.getElementById('url').value;
            const resultDiv = document.getElementById('result');
            const submitBtn = document.getElementById('submitBtn');
            const loadingSpinner = document.getElementById('loadingSpinner');
            const buttonText = document.getElementById('buttonText');
            
            // Паказваем стан загрузкі
            submitBtn.disabled = true;
            loadingSpinner.classList.remove('d-none');
            buttonText.textContent = 'Праверка...';
            resultDiv.innerHTML = '';
            
            try {
                const response = await fetch('', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: `url=${encodeURIComponent(url)}`
                });
                
                const data = await response.json();
                
                if (data.ok) {
                    resultDiv.innerHTML = '<div class="alert alert-success">Сайт даступны!</div>';
                } else {
                    resultDiv.innerHTML = '<div class="alert alert-danger">Сайт недаступны!</div>';
                }
            } catch (error) {
                resultDiv.innerHTML = '<div class="alert alert-danger">Памылка пры праверцы сайта!</div>';
            } finally {
                // Аднаўляем стан кнопкі
                submitBtn.disabled = false;
                loadingSpinner.classList.add('d-none');
                buttonText.textContent = 'Праверыць';
            }
        });
    </script>
</body>
</html>
