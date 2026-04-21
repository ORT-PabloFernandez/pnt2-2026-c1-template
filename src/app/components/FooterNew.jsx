import styles from "./FooterNew.module.css";

export default function FooterNew() {
  return (
    <footer className={styles["footer-new"]}>
      <div className={styles["footer-new__inner"]}>
        <div className={styles["footer-new__brand"]}>
          <span className={`material-symbols-outlined ${styles["footer-new__brand-icon"]}`}>
            group_work
          </span>
          <span>&copy; 2024 HubConnect. All rights reserved.</span>
        </div>

        <div className={styles["footer-new__links"]}>
          <a href="#" className={styles["footer-new__link"]}>
            Privacy Policy
          </a>
          <a href="#" className={styles["footer-new__link"]}>
            Terms of Service
          </a>
          <a href="#" className={styles["footer-new__link"]}>
            Help Center
          </a>
          <a href="#" className={styles["footer-new__link"]}>
            API Documentation
          </a>
        </div>
      </div>
    </footer>
  );
}
