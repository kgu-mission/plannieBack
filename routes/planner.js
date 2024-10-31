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
 * /planner/add:
 *   post:
 *     summary: 새로운 일정을 추가합니다.
 *     tags: [Planner]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: 일정 제목
 *               start_day:
 *                 type: string
 *                 format: date
 *                 description: 시작 날짜 (YYYY-MM-DD)
 *               end_day:
 *                 type: string
 *                 format: date
 *                 description: 종료 날짜 (YYYY-MM-DD)
 *               start_time:
 *                 type: string
 *                 format: time
 *                 description: 시작 시간 (HH:MM)
 *               end_time:
 *                 type: string
 *                 format: time
 *                 description: 종료 시간 (HH:MM)
 *               memo:
 *                 type: string
 *                 description: 메모
 *               notification:
 *                 type: boolean
 *                 description: 알림 여부
 *               repeat:
 *                 type: integer
 *                 description: 반복 여부
 *               check_box:
 *                 type: boolean
 *                 description: 체크박스
 *     responses:
 *       201:
 *         description: 일정이 생성되었습니다.
 *       500:
 *         description: 일정 생성 중 오류가 발생했습니다.
 */
router.post('/add', plannerController.createPlanner);

/**
 * @swagger
 * /planner/{id}:
 *   get:
 *     summary: 특정 ID의 일정을 조회합니다.
 *     tags: [Planner]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 조회할 일정의 ID
 *     responses:
 *       200:
 *         description: 일정 조회 성공
 *       404:
 *         description: 일정을 찾을 수 없습니다.
 *       500:
 *         description: 일정 조회 중 오류가 발생했습니다.
 */
router.get('/:id', plannerController.getPlannerById);

/**
 * @swagger
 * /planner/{id}:
 *   put:
 *     summary: 특정 ID의 일정을 수정합니다.
 *     tags: [Planner]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 수정할 일정의 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: 일정 제목
 *               start_day:
 *                 type: string
 *                 format: date
 *                 description: 시작 날짜 (YYYY-MM-DD)
 *               end_day:
 *                 type: string
 *                 format: date
 *                 description: 종료 날짜 (YYYY-MM-DD)
 *               start_time:
 *                 type: string
 *                 format: time
 *                 description: 시작 시간 (HH:MM)
 *               end_time:
 *                 type: string
 *                 format: time
 *                 description: 종료 시간 (HH:MM)
 *               memo:
 *                 type: string
 *                 description: 메모
 *               notification:
 *                 type: boolean
 *                 description: 알림 여부
 *               repeat:
 *                 type: integer
 *                 description: 반복 여부
 *               check_box:
 *                 type: boolean
 *                 description: 체크박스
 *     responses:
 *       200:
 *         description: 일정이 수정되었습니다.
 *       404:
 *         description: 일정을 찾을 수 없습니다.
 *       500:
 *         description: 일정 수정 중 오류가 발생했습니다.
 */
router.put('/:id', plannerController.updatePlannerById);

/**
 * @swagger
 * /planner/{id}:
 *   delete:
 *     summary: 특정 ID의 일정을 삭제합니다.
 *     tags: [Planner]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 삭제할 일정의 ID
 *     responses:
 *       200:
 *         description: 일정이 삭제되었습니다.
 *       404:
 *         description: 일정을 찾을 수 없습니다.
 *       500:
 *         description: 일정 삭제 중 오류가 발생했습니다.
 */
router.delete('/:id', plannerController.deletePlannerById);

module.exports = router;
