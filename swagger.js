// swagger.js
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger 설정 옵션
const swaggerOptions = {
    swaggerDefinition: {
        openapi: "3.0.0",
        info: {
            title: "Plannie API Documentation",
            version: "1.0.0",
            description: "Plannie API 문서",
        },
        servers: [
            {
                url: "http://localhost:3000", // 배포 시 실제 서버 URL로 변경
            },
        ],
    },
    apis: ["./routes/*.js"], // API 라우터 파일 경로
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);

module.exports = { swaggerUi, swaggerSpec };
