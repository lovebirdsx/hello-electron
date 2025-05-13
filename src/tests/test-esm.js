import { add } from './calc.js';

document.addEventListener('DOMContentLoaded', () => {
    const num1Input = document.getElementById('num1');
    const num2Input = document.getElementById('num2');
    const addButton = document.getElementById('addButton');
    const resultSpan = document.getElementById('result');

    if (!num1Input || !num2Input || !addButton || !resultSpan) {
        console.error("DOM elements not found!");
        return;
    }

    addButton.addEventListener('click', async () => {
        try {
            const num1 = parseFloat(num1Input.value) || 0;
            const num2 = parseFloat(num2Input.value) || 0;
            const sum = add(num1, num2);
            resultSpan.textContent = sum;
        } catch (error) {
            console.error("Error during calculation:", error);
            resultSpan.textContent = `错误: ${error.message}`; // 显示错误信息
        }
    });
});
