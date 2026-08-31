import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import servicesRouter from "./services";
import blogRouter from "./blog";
import testimonialsRouter from "./testimonials";
import faqRouter from "./faq";
import caseStudiesRouter from "./case_studies";
import pricingRouter from "./pricing";
import contactRouter from "./contact";
import statsRouter from "./stats";
import rankTrackerRouter from "./rank_tracker";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(servicesRouter);
router.use(blogRouter);
router.use(testimonialsRouter);
router.use(faqRouter);
router.use(caseStudiesRouter);
router.use(pricingRouter);
router.use(contactRouter);
router.use(statsRouter);
router.use(rankTrackerRouter);
router.use(dashboardRouter);

export default router;
