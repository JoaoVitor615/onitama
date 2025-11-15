import styles from "./styles.module.css";

export function Button() {
  return (
    <button className={styles.button}>
      <span className={styles.transition}></span>
      <span className={styles.gradient}></span>
      <span className={styles.label}>Entrar</span>
    </button>
  );
}
