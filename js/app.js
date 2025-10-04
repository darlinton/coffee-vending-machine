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
        this.currentDetectedGesture = 'neutral'; // 'select', 'back', 'neutral'
        this.currentGestureValue = 0; // Number of fingers for 'select', or specific code for 'back'
        
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
            console.log('initCamera: Attempting to get video elements.');
            
            this.videoElement = document.getElementById('videoElement');
            this.canvasElement = document.getElementById('canvasElement');
            this.canvasCtx = this.canvasElement.getContext('2d');

            if (!this.videoElement || !this.canvasElement) {
                console.error('initCamera: Video or canvas element not found.');
                this.updateDebugStatus('Erro: Elementos de vídeo/canvas não encontrados.');
                return;
            }
            console.log('initCamera: Video and canvas elements found.');

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
            console.log('initCamera: MediaPipe Hands initialized.');

            // Get camera stream
            console.log('initCamera: Requesting camera stream...');
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                }
            });
            console.log('initCamera: Camera stream obtained.', stream);

            this.videoElement.srcObject = stream;
            this.videoElement.onloadedmetadata = () => {
                console.log('initCamera: Video metadata loaded. Playing video.');
                this.videoElement.play();
                this.startGestureDetection();
                document.getElementById('startCameraBtn').style.display = 'none';
                document.getElementById('toggleCameraBtn').style.display = 'inline-flex';
                this.updateDebugStatus('Câmera ativa - Mostre sua mão!');
            };

        } catch (error) {
            console.error('initCamera: Erro ao acessar câmera:', error);
            this.updateDebugStatus('Erro: Não foi possível acessar a câmera');
            alert('Não foi possível acessar a câmera. Verifique as permissões do navegador ou se há uma câmera disponível.');
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
            
            // Detect gesture type
            const gesture = this.detectGesture(landmarks);
            this.processGesture(gesture);
        } else {
            // No hand detected, reset to neutral
            this.processGesture({ type: 'neutral', value: 0 });
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

    // Detects gesture type (fingers, thumbs down, neutral)
    detectGesture(landmarks) {
        const fingerTips = {
            thumb: 4,
            index: 8,
            middle: 12,
            ring: 16,
            pinky: 20
        };
        const fingerMcps = {
            thumb: 2,
            index: 5,
            middle: 9,
            ring: 13,
            pinky: 17
        };
        const fingerPips = {
            thumb: 3,
            index: 6,
            middle: 10,
            ring: 14,
            pinky: 18
        };

        // Helper to check if a finger is extended
        const isFingerExtended = (fingerName) => {
            const tip = landmarks[fingerTips[fingerName]];
            const pip = landmarks[fingerPips[fingerName]];
            const mcp = landmarks[fingerMcps[fingerName]];

            if (fingerName === 'thumb') {
                // A more robust check: Is the thumb tip farther from the palm than its knuckle?
                // We use the index finger's base knuckle as a stable anchor point for the palm.
                const indexFingerMcp = landmarks[5];
                const tip = landmarks[4];
                const mcp = landmarks[2];

                // Distance from the thumb tip to the palm (index finger base)
                const tipToPalmDist = Math.hypot(tip.x - indexFingerMcp.x, tip.y - indexFingerMcp.y);

                // Distance from the thumb knuckle to the palm (index finger base)
                const mcpToPalmDist = Math.hypot(mcp.x - indexFingerMcp.x, mcp.y - indexFingerMcp.y);

                // LOG THE VALUES TO THE CONSOLE
                //console.log(`Thumb distances -- tipToPalmDist: ${tipToPalmDist}, mcpToPalmDist: ${mcpToPalmDist}`);

                // If the tip is farther from the palm than the knuckle, the thumb is extended.
                return tipToPalmDist > mcpToPalmDist;
            } else {
                // For other fingers, check if the tip is above the pip and mcp
                return tip.y < pip.y && tip.y < mcp.y;
            }
        };

        // Check each finger's state
        const extendedFingers = {
            thumb: isFingerExtended('thumb'),
            index: isFingerExtended('index'),
            middle: isFingerExtended('middle'),
            ring: isFingerExtended('ring'),
            pinky: isFingerExtended('pinky')
        };

        const extendedCount = Object.values(extendedFingers).filter(Boolean).length;
        const nonThumbExtendedCount = extendedCount - (extendedFingers.thumb ? 1 : 0);

        // --- Gesture Logic ---

        // --- Strict Index Finger Rule --- 
        // // Assume extendedFingers, extendedCount, and nonThumbExtendedCount are pre-calculated correctly
        /*
        console.log(
            `Thumb:${extendedFingers.thumb}, Index:${extendedFingers.index}, Mid:${extendedFingers.middle}, Ring:${extendedFingers.ring}, Pinky:${extendedFingers.pinky} --- Total:${extendedCount}`
        ); */

        // 1. Thumbs Down (Back Gesture)
        const thumbTip = landmarks[fingerTips.thumb];
        const thumbMcp = landmarks[fingerMcps.thumb];
        const indexMcp = landmarks[fingerMcps.index];
        const isThumbPointingDown = thumbTip.y > thumbMcp.y && thumbTip.y > indexMcp.y;
        // const isThumbPointingDown = thumbTip.y > thumbMcp.y;

        if (isThumbPointingDown && nonThumbExtendedCount === 0) {
            return { type: 'back', value: 0 };
        }

        // 2. Gesture for 5
        if (extendedCount === 5) {
            return { type: 'select', value: 5 };
        }

        // 3. Counting Gestures (1-4) with STRICT INDEX FINGER RULE
        // This requires the index finger to be up for any count between 1 and 4.
        // The thumb must also be down.
        if (extendedFingers.index && !extendedFingers.thumb) {
            return { type: 'select', value: nonThumbExtendedCount };
        }

        // 4. Neutral Gesture (Fist or other)
        return { type: 'neutral', value: 0 };
    }

    processGesture(gesture) {
        const now = Date.now();
        
        // Update stable gesture count
        if (gesture.type === this.currentDetectedGesture && gesture.value === this.currentGestureValue) {
            this.stableGestureCount++;
        } else {
            this.currentDetectedGesture = gesture.type;
            this.currentGestureValue = gesture.value;
            this.stableGestureCount = 0;
        }
        
        // Update display
        this.updateGestureDisplay(gesture.value, gesture.type);
        
        // Process gesture if stable and cooldown has passed
        if (this.stableGestureCount >= 15) { // Require 15 frames of stability
            if (now - this.lastGestureTime > 2000) { // 2 second cooldown between actions
                if (gesture.type === 'select') {
                    this.selectOption(gesture.value);
                    this.lastGestureTime = now;
                } else if (gesture.type === 'back') {
                    this.previousStep();
                    this.lastGestureTime = now;
                }
                // Neutral gesture does nothing
            }
        }
    }

    updateGestureDisplay(value, type) {
        const gestureIndicator = document.getElementById('gestureIndicator');
        const gestureCount = document.getElementById('gestureCount');
        
        if (type === 'select') {
            gestureCount.textContent = value;
            gestureIndicator.style.background = 'rgba(76, 175, 80, 0.9)'; // Green for selection
            gestureIndicator.querySelector('i').className = 'fas fa-hand-paper';
        } else if (type === 'back') {
            gestureCount.textContent = '↩️'; // Or some other indicator for back
            gestureIndicator.style.background = 'rgba(255, 165, 0, 0.9)'; // Orange for back
            gestureIndicator.querySelector('i').className = 'fas fa-thumbs-down';
        } else { // Neutral
            gestureCount.textContent = '✊'; // Fist icon
            gestureIndicator.style.background = 'rgba(0, 0, 0, 0.8)'; // Default background
            gestureIndicator.querySelector('i').className = 'fas fa-fist-raised';
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

    previousStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.updateStepDisplay();
            this.updateProgressBar();
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
            console.error('Erro ao processar pedido:', error);
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
