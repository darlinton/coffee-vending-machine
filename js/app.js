// ========== GLOBAL STATE ========== 
class CoffeeOrderApp {
    constructor() {
        this.currentStep = 0;
        this.totalSteps = 5;
        this.order = {
            tipo: null,
            tamanho: null,
            personalizacao: null,
            pagamento: null,
            preco: 0
        };
        
        this.gestureDetectionActive = false;
        this.lastGestureTime = 0;
        this.gestureTimeout = null;
        this.stableGestureCount = 0;
        this.currentDetectedFingers = 0;
        
        // MediaPipe Hands
        this.hands = null;
        this.camera = null;
        this.videoElement = null;
        this.canvasElement = null;
        this.canvasCtx = null;
        
        // Coffee data
        this.coffeeData = {
            tipos: [
                { id: 1, name: 'Espresso', price: 4.50, icon: 'fas fa-coffee' },
                { id: 2, name: 'Americano', price: 5.00, icon: 'fas fa-mug-hot' },
                { id: 3, name: 'Latte', price: 7.50, icon: 'fas fa-glass-whiskey' },
                { id: 4, name: 'Cappuccino', price: 8.00, icon: 'fas fa-wine-glass-alt' },
                { id: 5, name: 'Frappé', price: 9.50, icon: 'fas fa-snowflake' }
            ],
            tamanhos: [
                { id: 1, name: 'Pequeno', size: '150ml', priceAdd: 0 },
                { id: 2, name: 'Médio', size: '250ml', priceAdd: 1.50 },
                { id: 3, name: 'Grande', size: '350ml', priceAdd: 3.00 },
                { id: 4, name: 'Extra Grande', size: '500ml', priceAdd: 4.50 },
                { id: 5, name: 'Família', size: '700ml', priceAdd: 6.00 }
            ],
            personalizacoes: {
                1: [  // Espresso
                    { id: 1, name: 'Tradicional', desc: 'Clássico italiano' },
                    { id: 2, name: 'Duplo', desc: 'Dose dupla' },
                    { id: 3, name: 'Lungo', desc: 'Mais água, menos intenso' },
                    { id: 4, name: 'Ristretto', desc: 'Mais concentrado' },
                    { id: 5, name: 'Com Açúcar', desc: 'Açúcar refinado' }
                ],
                2: [  // Americano
                    { id: 1, name: 'Tradicional', desc: 'Proporção clássica' },
                    { id: 2, name: 'Forte', desc: 'Menos água' },
                    { id: 3, name: 'Suave', desc: 'Mais água' },
                    { id: 4, name: 'Quente', desc: 'Extra quente' },
                    { id: 5, name: 'Com Leite', desc: 'Pingado americano' }
                ],
                3: [  // Latte
                    { id: 1, name: 'Tradicional', desc: 'Leite vaporizado clássico' },
                    { id: 2, name: 'Baunilha', desc: 'Com xarope de baunilha' },
                    { id: 3, name: 'Caramelo', desc: 'Com calda de caramelo' },
                    { id: 4, name: 'Canela', desc: 'Com canela em pó' },
                    { id: 5, name: 'Sem Lactose', desc: 'Com leite vegetal' }
                ],
                4: [  // Cappuccino
                    { id: 1, name: 'Tradicional', desc: 'Espuma cremosa clássica' },
                    { id: 2, name: 'Chocolate', desc: 'Com cacau em pó' },
                    { id: 3, name: 'Canela', desc: 'Com canela polvilhada' },
                    { id: 4, name: 'Dry', desc: 'Mais espuma, menos leite' },
                    { id: 5, name: 'Wet', desc: 'Mais leite, menos espuma' }
                ],
                5: [  // Frappé
                    { id: 1, name: 'Natural', desc: 'Café gelado puro' },
                    { id: 2, name: 'Baunilha', desc: 'Com sorvete de baunilha' },
                    { id: 3, name: 'Chocolate', desc: 'Com calda de chocolate' },
                    { id: 4, name: 'Caramelo', desc: 'Com caramelo e chantilly' },
                    { id: 5, name: 'Mocha', desc: 'Café, chocolate e chantilly' }
                ]
            },
            pagamentos: [
                { id: 1, name: 'Cartão de Crédito', icon: 'fas fa-credit-card' },
                { id: 2, name: 'PIX', icon: 'fas fa-qrcode' },
                { id: 3, name: 'Dinheiro', icon: 'fas fa-money-bill-wave' },
                { id: 4, name: 'Google Pay', icon: 'fab fa-google-pay' },
                { id: 5, name: 'Apple Pay', icon: 'fab fa-apple-pay' }
            ]
        };
        
        this.init();
    }

    // ========== INITIALIZATION ==========
    async init() {
        try {
            this.updateDebugStatus('Inicializando aplicação...');
            this.setupEventListeners();
            this.updateProgressBar();
            this.populateCustomizationOptions();
            this.updateDebugStatus('Aplicação inicializada. Clique em "Ativar Câmera"');
        } catch (error) {
            console.error('Erro na inicialização:', error);
            this.updateDebugStatus('Erro na inicialização');
        }
    }

    setupEventListeners() {
        document.getElementById('startCameraBtn').addEventListener('click', () => this.initCamera());
        document.getElementById('toggleCameraBtn').addEventListener('click', () => this.toggleCamera());
        
        // Gesture selection fallback (click/touch)
        document.querySelectorAll('.option').forEach(option => {
            option.addEventListener('click', (e) => {
                const value = parseInt(e.currentTarget.dataset.value);
                this.selectOption(value);
            });
        });
    }

    // ========== CAMERA & MEDIAPIPE ==========
    async initCamera() {
        try {
            this.updateDebugStatus('Solicitando acesso à câmera...');
            
            this.videoElement = document.getElementById('videoElement');
            this.canvasElement = document.getElementById('canvasElement');
            this.canvasCtx = this.canvasElement.getContext('2d');

            // Initialize MediaPipe Hands
            this.hands = new Hands({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
                }
            });

            this.hands.setOptions({
                maxNumHands: 1,
                modelComplexity: 1,
                minDetectionConfidence: 0.7,
                minTrackingConfidence: 0.5
            });

            this.hands.onResults((results) => this.onHandsResults(results));

            // Get camera stream
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                }
            });

            this.videoElement.srcObject = stream;
            this.videoElement.onloadedmetadata = () => {
                this.videoElement.play();
                this.startGestureDetection();
                document.getElementById('startCameraBtn').style.display = 'none';
                document.getElementById('toggleCameraBtn').style.display = 'inline-flex';
                this.updateDebugStatus('Câmera ativa - Mostre sua mão!');
            };

        } catch (error) {
            console.error('Erro ao acessar câmera:', error);
            this.updateDebugStatus('Erro: Não foi possível acessar a câmera');
            alert('Não foi possível acessar a câmera. Verifique as permissões do navegador.');
        }
    }

    startGestureDetection() {
        this.gestureDetectionActive = true;
        
        const detectFrame = async () => {
            if (this.gestureDetectionActive && this.videoElement.readyState >= 2) {
                // Resize canvas to match video
                this.canvasElement.width = this.videoElement.videoWidth;
                this.canvasElement.height = this.videoElement.videoHeight;
                
                await this.hands.send({ image: this.videoElement });
            }
            if (this.gestureDetectionActive) {
                requestAnimationFrame(detectFrame);
            }
        };
        
        detectFrame();
    }

    onHandsResults(results) {
        // Clear canvas
        this.canvasCtx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];
            
            // Draw hand landmarks
            this.drawHandLandmarks(landmarks);
            
            // Count extended fingers
            const fingerCount = this.countExtendedFingers(landmarks);
            this.processGesture(fingerCount);
        } else {
            this.currentDetectedFingers = 0;
            this.updateGestureDisplay(0);
        }
    }

    drawHandLandmarks(landmarks) {
        // Draw connections
        this.canvasCtx.strokeStyle = '#FFFFFF';
        this.canvasCtx.lineWidth = 2;
        
        const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4],           // Thumb
            [0, 5], [5, 6], [6, 7], [7, 8],           // Index finger
            [0, 9], [9, 10], [10, 11], [11, 12],      // Middle finger
            [0, 13], [13, 14], [14, 15], [15, 16],    // Ring finger
            [0, 17], [17, 18], [18, 19], [19, 20],    // Pinky
            [5, 9], [9, 13], [13, 17]                 // Palm
        ];
        
        this.canvasCtx.beginPath();
        connections.forEach(([start, end]) => {
            const startPoint = landmarks[start];
            const endPoint = landmarks[end];
            this.canvasCtx.moveTo(startPoint.x * this.canvasElement.width, startPoint.y * this.canvasElement.height);
            this.canvasCtx.lineTo(endPoint.x * this.canvasElement.width, endPoint.y * this.canvasElement.height);
        });
        this.canvasCtx.stroke();

        // Draw landmarks
        this.canvasCtx.fillStyle = '#FF6B6B';
        landmarks.forEach(landmark => {
            this.canvasCtx.beginPath();
            this.canvasCtx.arc(
                landmark.x * this.canvasElement.width,
                landmark.y * this.canvasElement.height,
                4, 0, 2 * Math.PI
            );
            this.canvasCtx.fill();
        });
    }

    countExtendedFingers(landmarks) {
        let count = 0;
        
        // Thumb (check x-coordinate relative to hand)
        if (landmarks[4].x > landmarks[3].x) {
            count++;
        }
        
        // Other fingers (check y-coordinate)
        const fingerTips = [8, 12, 16, 20]; // Index, middle, ring, pinky
        const fingerPips = [6, 10, 14, 18];
        
        for (let i = 0; i < fingerTips.length; i++) {
            if (landmarks[fingerTips[i]].y < landmarks[fingerPips[i]].y) {
                count++;
            }
        }
        
        return Math.min(count, 5); // Max 5 fingers
    }

    processGesture(fingerCount) {
        const now = Date.now();
        
        if (fingerCount === this.currentDetectedFingers) {
            this.stableGestureCount++;
        } else {
            this.currentDetectedFingers = fingerCount;
            this.stableGestureCount = 0;
        }
        
        // Update display immediately
        this.updateGestureDisplay(fingerCount);
        
        // Require stable gesture for selection
        if (this.stableGestureCount >= 15 && fingerCount > 0 && fingerCount <= 5) {
            if (now - this.lastGestureTime > 2000) { // 2 second cooldown
                this.selectOption(fingerCount);
                this.lastGestureTime = now;
                this.stableGestureCount = 0;
            }
        }
    }

    updateGestureDisplay(count) {
        const gestureIndicator = document.getElementById('gestureIndicator');
        const gestureCount = document.getElementById('gestureCount');
        
        gestureCount.textContent = count;
        
        if (count > 0 && count <= 5) {
            gestureIndicator.style.background = 'rgba(76, 175, 80, 0.9)';
        } else {
            gestureIndicator.style.background = 'rgba(0, 0, 0, 0.8)';
        }
    }

    // ========== STEP MANAGEMENT ==========
    selectOption(value) {
        if (value < 1 || value > 5) return;
        
        // Clear previous selections in current step
        document.querySelectorAll(`#step${this.currentStep} .option`).forEach(opt => {
            opt.classList.remove('selected');
        });
        
        // Mark selected option
        const selectedOption = document.querySelector(`#step${this.currentStep} .option[data-value="${value}"]`);
        if (selectedOption) {
            selectedOption.classList.add('selected');
            
            // Store selection
            switch (this.currentStep) {
                case 0: // Coffee type
                    this.order.tipo = this.coffeeData.tipos[value - 1];
                    this.populateCustomizationOptions();
                    break;
                case 1: // Size
                    this.order.tamanho = this.coffeeData.tamanhos[value - 1];
                    break;
                case 2: // Customization
                    const customizations = this.coffeeData.personalizacoes[this.order.tipo.id];
                    this.order.personalizacao = customizations[value - 1];
                    break;
                case 3: // Payment
                    this.order.pagamento = this.coffeeData.pagamentos[value - 1];
                    break;
            }
            
            // Auto advance after selection
            setTimeout(() => {
                this.nextStep();
            }, 1000);
        }
    }

    nextStep() {
        if (this.currentStep < this.totalSteps - 1) {
            this.currentStep++;
            this.updateStepDisplay();
            this.updateProgressBar();
            
            if (this.currentStep === 4) { // Final step
                this.processOrder();
            }
        }
    }

    updateStepDisplay() {
        // Update step panels
        document.querySelectorAll('.step-panel').forEach((panel, index) => {
            panel.classList.toggle('active', index === this.currentStep);
        });
        
        // Update step indicators
        document.querySelectorAll('.step').forEach((step, index) => {
            step.classList.remove('active', 'completed');
            if (index < this.currentStep) {
                step.classList.add('completed');
            } else if (index === this.currentStep) {
                step.classList.add('active');
            }
        });
    }

    updateProgressBar() {
        const progressBar = document.getElementById('progressBar');
        const progress = ((this.currentStep + 1) / this.totalSteps) * 100;
        progressBar.style.width = `${progress}%`;
    }

    populateCustomizationOptions() {
        if (!this.order.tipo) return;
        
        const customizationGrid = document.getElementById('customizationOptions');
        const customizations = this.coffeeData.personalizacoes[this.order.tipo.id];
        
        customizationGrid.innerHTML = '';
        
        customizations.forEach((custom, index) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'option';
            optionDiv.dataset.value = index + 1;
            
            optionDiv.innerHTML = `
                <div class="option-number">${index + 1}</div>
                <i class="fas fa-cog"></i>
                <h3>${custom.name}</h3>
                <p>${custom.desc}</p>
            `;
            
            optionDiv.addEventListener('click', () => {
                this.selectOption(index + 1);
            });
            
            customizationGrid.appendChild(optionDiv);
        });
    }

    // ========== ORDER PROCESSING ==========
    calculateTotal() {
        let total = 0;
        
        if (this.order.tipo) total += this.order.tipo.price;
        if (this.order.tamanho) total += this.order.tamanho.priceAdd;
        
        return total;
    }

    async processOrder() {
        this.updateDebugStatus('Processando pedido...');
        
        const total = this.calculateTotal();
        this.order.preco = total;
        
        // Show order summary
        this.displayOrderSummary();
        
        // Show processing animation
        document.getElementById('processingOrder').style.display = 'flex';
        document.getElementById('orderComplete').style.display = 'none';
        
        try {
            // Simulate processing time
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Generate pickup code
            const pickupCode = this.generatePickupCode();
            
            // Save order to database
            await this.saveOrderToDatabase(pickupCode);
            
            // Show completion
            this.showOrderComplete(pickupCode);
            
        } catch (error) {
            console.error('Erro ao processar pedido:', error);
            this.updateDebugStatus('Erro ao processar pedido');
            alert('Erro ao processar pedido. Tente novamente.');
        }
    }

    displayOrderSummary() {
        const orderDetails = document.getElementById('orderDetails');
        const totalPrice = document.getElementById('totalPrice');
        
        const total = this.calculateTotal();
        
        orderDetails.innerHTML = `
            <div class="order-item">
                <span><strong>${this.order.tipo.name}</strong></span>
                <span>R$ ${this.order.tipo.price.toFixed(2)}</span>
            </div>
            <div class="order-item">
                <span>Tamanho: ${this.order.tamanho.name} (${this.order.tamanho.size})</span>
                <span>${this.order.tamanho.priceAdd > 0 ? '+' : ''}R$ ${this.order.tamanho.priceAdd.toFixed(2)}</span>
            </div>
            <div class="order-item">
                <span>Personalização: ${this.order.personalizacao.name}</span>
                <span>-</span>
            </div>
            <div class="order-item">
                <span>Pagamento: ${this.order.pagamento.name}</span>
                <span>-</span>
            </div>
        `;
        
        totalPrice.textContent = `R$ ${total.toFixed(2)}`;
    }

    generatePickupCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 4; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    async saveOrderToDatabase(pickupCode) {
        const orderData = {
            codigo_retirada: pickupCode,
            tipo_cafe: this.order.tipo.name,
            tamanho: `${this.order.tamanho.name} (${this.order.tamanho.size})`,
            personalizacao: this.order.personalizacao.name,
            meio_pagamento: this.order.pagamento.name,
            preco_total: this.order.preco,
            status: 'processando',
            timestamp: new Date().toISOString()
        };

        try {
            const response = await fetch('tables/pedidos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            });

            if (!response.ok) {
                throw new Error('Erro ao salvar pedido');
            }

            const result = await response.json();
            console.log('Pedido salvo:', result);
            this.updateDebugStatus('Pedido salvo com sucesso!');
            
        } catch (error) {
            console.error('Erro ao salvar pedido:', error);
            this.updateDebugStatus('Erro ao salvar pedido no servidor');
        }
    }

    showOrderComplete(pickupCode) {
        document.getElementById('processingOrder').style.display = 'none';
        document.getElementById('orderComplete').style.display = 'block';
        document.getElementById('pickupCode').textContent = pickupCode;
        
        this.updateDebugStatus(`Pedido finalizado! Código: ${pickupCode}`);
    }

    // ========== UTILITY FUNCTIONS ==========
    updateDebugStatus(message) {
        document.getElementById('debugStatus').textContent = message;
        console.log('Status:', message);
    }

    toggleCamera() {
        // This would implement camera switching (front/back)
        // For now, just restart the camera
        this.initCamera();
    }
}

// ========== GLOBAL FUNCTIONS ==========
function resetApp() {
    location.reload();
}

// ========== APP INITIALIZATION ==========
let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new CoffeeOrderApp();
});

// ========== ERROR HANDLING ==========
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    if (app) {
        app.updateDebugStatus('Erro na aplicação');
    }
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    if (app) {
        app.updateDebugStatus('Erro de conexão');
    }
});