// routes/planner.js
const express = require('express');
const router = express.Router();
const plannerController = require('../controllers/plannerController');

/**
 * @swagger
 * tags:
 *   name: Planner
 *   description: 일정 관리 API
 */

/**
 * @swagger
 * /planner:
 *   post:
 *     summary: 일정 생성
 *     description: 새로운 일정을 생성합니다.
 *     tags: [Planner]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               start_day:
 *                 type: string
 *                 description: "시작 날짜 (YYYY.MM.DD)"
 *                 example: "2024.11.01"
 *               end_day:
 *                 type: string
 *                 description: "종료 날짜 (YYYY.MM.DD, 선택 사항)"
 *                 example: "2024.11.02"
 *               title:
 *                 type: string
 *                 description: "일정 제목"
 *                 example: "회의"
 *               start_time:
 *                 type: string
 *                 description: "시작 시간 (HH:MM)"
 *                 example: "10:00"
 *               end_time:
 *                 type: string
 *                 description: "종료 시간 (HH:MM)"
 *                 example: "11:00"
 *               memo:
 *                 type: string
 *                 description: "일정 메모"
 *                 example: "중요한 회의"
 *               notification:
 *                 type: string
 *                 description: "알림 설정 (예: 10분 전)"
 *                 example: "10분 전"
 *               repeat:
 *                 type: string
 *                 description: "반복 설정 (예: 매주 월요일)"
 *                 example: "월"
 *               check_box:
 *                 type: boolean
 *                 description: "체크박스 상태"
 *                 example: true
 *               url:
 *                 type: string
 *                 description: "참조 URL"
 *                 example: "https://example.com"
 *     responses:
 *       201:
 *         description: 일정이 성공적으로 생성되었습니다.
 *       400:
 *         description: 잘못된 요청 데이터입니다.
 *       500:
 *         description: 서버 오류
 */
router.post('/', plannerController.createPlanner);

/**
 * @swagger
 * /planner/date:
 *   get:
 *     summary: 특정 날짜의 일정 조회
 *     description: 주어진 날짜에 해당하는 일정을 조회합니다.
 *     tags: [Planner]
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *         required: true
 *         description: "조회할 날짜 (YYYY.MM.DD)"
 *         example: "2024.11.01"
 *     responses:
 *       200:
 *         description: 성공적으로 조회된 일정 리스트를 반환합니다.
 *       400:
 *         description: 잘못된 날짜 형식입니다.
 *       500:
 *         description: 서버 오류
 */
router.get('/date', plannerController.getPlannersByDate);

/**
 * @swagger
 * /planner/{id}:
 *   get:
 *     summary: 특정 ID의 일정 조회
 *     description: 특정 일정 ID에 해당하는 일정을 조회합니다.
 *     tags: [Planner]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: "조회할 일정의 ID"
 *         example: 1
 *     responses:
 *       200:
 *         description: 요청한 일정 정보를 반환합니다.
 *       404:
 *         description: 해당 ID의 일정을 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류
 */
router.get('/:id', plannerController.getPlannerById);

/**
 * @swagger
 * /planner/{id}:
 *   put:
 *     summary: 일정 수정
 *     description: 특정 ID의 일정을 수정합니다.
 *     tags: [Planner]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: "수정할 일정의 ID"
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               start_day:
 *                 type: string
 *                 description: "시작 날짜 (YYYY.MM.DD)"
 *                 example: "2024.11.01"
 *               end_day:
 *                 type: string
 *                 description: "종료 날짜 (YYYY.MM.DD)"
 *                 example: "2024.11.02"
 *               title:
 *                 type: string
 *                 description: "일정 제목"
 *                 example: "수정된 회의"
 *               start_time:
 *                 type: string
 *                 description: "시작 시간 (HH:MM)"
 *                 example: "09:00"
 *               end_time:
 *                 type: string
 *                 description: "종료 시간 (HH:MM)"
 *                 example: "10:00"
 *               memo:
 *                 type: string
 *                 description: "일정 메모"
 *                 example: "수정된 중요 회의"
 *               notification:
 *                 type: string
 *                 description: "알림 설정"
 *                 example: "10분 전"
 *               repeat:
 *                 type: string
 *                 description: "반복 설정"
 *                 example: "월"
 *               check_box:
 *                 type: boolean
 *                 description: "체크박스 상태"
 *                 example: true
 *               url:
 *                 type: string
 *                 description: "참조 URL"
 *                 example: "https://example.com"
 *     responses:
 *       200:
 *         description: 일정이 성공적으로 수정되었습니다.
 *       404:
 *         description: 해당 ID의 일정을 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류
 */
router.put('/:id', plannerController.updatePlannerById);

/**
 * @swagger
 * /planner/{id}:
 *   delete:
 *     summary: 일정 삭제
 *     description: 특정 ID의 일정을 삭제합니다.
 *     tags: [Planner]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: "삭제할 일정의 ID"
 *         example: 1
 *     responses:
 *       200:
 *         description: 일정이 성공적으로 삭제되었습니다.
 *       404:
 *         description: 해당 ID의 일정을 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류
 */
router.delete('/:id', plannerController.deletePlannerById);

/**
 * @swagger
 * /planner/month:
 *   get:
 *     summary: 특정 월의 일정 조회
 *     description: 특정 년도와 월에 해당하는 일정을 조회합니다.
 *     tags: [Planner]
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: string
 *         required: true
 *         description: "조회할 년도 (예: 2024)"
 *         example: "2024"
 *       - in: query
 *         name: month
 *         schema:
 *           type: string
 *         required: true
 *         description: "조회할 월 (1부터 12까지의 값)"
 *         example: "11"
 *     responses:
 *       200:
 *         description: 요청한 월에 해당하는 일정 리스트를 반환합니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: "일정의 고유 ID"
 *                     example: 1
 *                   title:
 *                     type: string
 *                     description: "일정 제목"
 *                     example: "회의"
 *                   start_day:
 *                     type: string
 *                     format: date
 *                     description: "일정 시작 날짜"
 *                     example: "2024-11-01"
 *                   end_day:
 *                     type: string
 *                     format: date
 *                     description: "일정 종료 날짜"
 *                     example: "2024-11-02"
 *                   start_time:
 *                     type: string
 *                     description: "일정 시작 시간 (HH:MM)"
 *                     example: "10:00"
 *                   end_time:
 *                     type: string
 *                     description: "일정 종료 시간 (HH:MM)"
 *                     example: "11:00"
 *                   memo:
 *                     type: string
 *                     description: "일정 메모"
 *                     example: "중요한 회의"
 *                   notification:
 *                     type: string
 *                     description: "알림 설정"
 *                     example: "10분 전"
 *                   repeat:
 *                     type: string
 *                     description: "반복 설정"
 *                     example: "월"
 *                   check_box:
 *                     type: boolean
 *                     description: "체크박스 상태"
 *                     example: false
 *                   url:
 *                     type: string
 *                     description: "참조 URL"
 *                     example: "https://example.com"
 *       400:
 *         description: 잘못된 년도 또는 월 형식입니다.
 *       500:
 *         description: 서버 오류
 */
router.get('/month', plannerController.getPlannersByMonth);

module.exports = router;
