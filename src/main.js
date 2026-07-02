(function () {
    "use strict";

    // Central place for anything that would normally live in env config.
    var CONFIG = {
        WAITLIST_API_ENDPOINT:
            "https://keystoneacoustics-unairderien.vercel.app/api/waitlist",
        SIMULATED_LATENCY_MS: 1100,
        SIMULATED_FAILURE_RATE: 0.25,
    };

    var prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
    ).matches;

    /* ---------------- header scroll state ---------------- */
    function initHeaderState() {
        var header = document.getElementById("site-header");
        if (!header) return;
        var onScroll = function () {
            header.classList.toggle("is-scrolled", window.scrollY > 8);
        };
        onScroll();
        window.addEventListener("scroll", onScroll, {
            passive: true,
        });
    }

    /* ---------------- scroll reveal ---------------- */
    function initScrollReveal() {
        var targets = document.querySelectorAll("[data-reveal]");
        if (!targets.length) return;

        if (!("IntersectionObserver" in window) || prefersReducedMotion) {
            targets.forEach(function (el) {
                el.classList.add("is-visible");
            });
            return;
        }

        var observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15, rootMargin: "0px 0px -60px 0px" },
        );

        targets.forEach(function (el) {
            observer.observe(el);
        });
    }

    /* ---------------- waveform (signature interactive element) ---------------- */
    function initWaveform() {
        var container = document.getElementById("waveform");
        var status = document.getElementById("waveform-status");
        if (!container) return;

        var bars = [];

        function buildBars() {
            container.innerHTML = "";
            bars = [];
            var containerWidth = container.clientWidth || 400;
            var targetBarWidth = 8;
            var count = Math.max(
                20,
                Math.min(64, Math.round(containerWidth / targetBarWidth)),
            );

            for (var i = 0; i < count; i++) {
                var el = document.createElement("div");
                el.className = "bar";
                container.appendChild(el);
                bars.push({
                    el: el,
                    phase: Math.random() * Math.PI * 2,
                    freq: 0.0009 + Math.random() * 0.0007,
                    base: 0.14 + Math.random() * 0.1,
                    boost: 0,
                });
            }
        }

        function render(height) {
            // height 0..1, applied without the animation loop (reduced motion / static state)
            bars.forEach(function (bar) {
                bar.el.style.transform =
                    "scaleY(" +
                    Math.max(0.06, height !== undefined ? height : bar.base) +
                    ")";
            });
        }

        buildBars();

        if (prefersReducedMotion) {
            render();
            return;
        }

        var rafId = null;
        function loop(time) {
            bars.forEach(function (bar) {
                var idle =
                    bar.base + Math.sin(time * bar.freq + bar.phase) * 0.05;
                bar.boost *= 0.92;
                var value = Math.min(1, idle + bar.boost);
                bar.el.style.transform = "scaleY(" + value + ")";
            });
            rafId = requestAnimationFrame(loop);
        }
        rafId = requestAnimationFrame(loop);

        function boostNear(clientX, strength, spread) {
            var rect = container.getBoundingClientRect();
            var relativeX = (clientX - rect.left) / rect.width;
            var centerIndex = relativeX * bars.length;
            bars.forEach(function (bar, i) {
                var distance = Math.abs(i - centerIndex);
                if (distance < spread) {
                    var falloff = 1 - distance / spread;
                    bar.boost = Math.max(bar.boost, strength * falloff);
                }
            });
        }

        container.addEventListener("mousemove", function (e) {
            boostNear(e.clientX, 0.5, 6);
            status.textContent = "LISTENING";
        });
        container.addEventListener("mouseleave", function () {
            status.textContent = "IDLE";
        });
        container.addEventListener("click", function (e) {
            boostNear(e.clientX, 0.85, bars.length);
            status.textContent = "STRIKE";
            window.setTimeout(function () {
                status.textContent = "IDLE";
            }, 900);
        });

        var resizeTimer = null;
        window.addEventListener("resize", function () {
            window.clearTimeout(resizeTimer);
            resizeTimer = window.setTimeout(function () {
                var previousCount = bars.length;
                buildBars();
                if (bars.length !== previousCount) {
                    /* rebuilt to match new width */
                }
            }, 200);
        });
    }

    /* ---------------- waitlist form ---------------- */
    function initWaitlistForm() {
        var form = document.getElementById("waitlist-form");
        if (!form) return;

        var submitBtn = document.getElementById("wl-submit");
        var statusEl = document.getElementById("wl-status");
        var fields = {
            name: document.getElementById("wl-name"),
            email: document.getElementById("wl-email"),
            model: document.getElementById("wl-model"),
        };
        var errors = {
            name: document.getElementById("wl-name-error"),
            email: document.getElementById("wl-email-error"),
            model: document.getElementById("wl-model-error"),
        };

        var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        function setFieldError(key, message) {
            var field = fields[key];
            var errorEl = errors[key];
            if (message) {
                field.setAttribute("aria-invalid", "true");
                errorEl.textContent = message;
                errorEl.classList.add("is-visible");
            } else {
                field.removeAttribute("aria-invalid");
                errorEl.textContent = "";
                errorEl.classList.remove("is-visible");
            }
        }

        function validate() {
            var valid = true;
            var firstInvalid = null;

            if (
                !fields.name.value.trim() ||
                fields.name.value.trim().length < 2
            ) {
                setFieldError(
                    "name",
                    "Enter your name so we know who to follow up with.",
                );
                valid = false;
                firstInvalid = firstInvalid || fields.name;
            } else {
                setFieldError("name", "");
            }

            if (!emailPattern.test(fields.email.value.trim())) {
                setFieldError("email", "Enter a valid email address.");
                valid = false;
                firstInvalid = firstInvalid || fields.email;
            } else {
                setFieldError("email", "");
            }

            if (!fields.model.value) {
                setFieldError(
                    "model",
                    "Choose a model, or select \u201cNot sure yet.\u201d",
                );
                valid = false;
                firstInvalid = firstInvalid || fields.model;
            } else {
                setFieldError("model", "");
            }

            if (firstInvalid) firstInvalid.focus();
            return valid;
        }

        function showStatus(kind, message) {
            statusEl.textContent = message;
            statusEl.className = "form-status is-visible " + kind;
        }

        function clearStatus() {
            statusEl.textContent = "";
            statusEl.className = "form-status";
        }

        // Stands in for a real network call. Rejects at a fixed rate so the
        // unhappy path (and the retry it leaves the form in) is easy to exercise.
        function simulateWaitlistRequest(payload) {
            return new Promise(function (resolve, reject) {
                window.setTimeout(function () {
                    if (Math.random() < CONFIG.SIMULATED_FAILURE_RATE) {
                        reject(
                            new Error(
                                "The request to " +
                                    CONFIG.WAITLIST_API_ENDPOINT +
                                    " timed out.",
                            ),
                        );
                    } else {
                        resolve({
                            queuePosition: 118 + Math.floor(Math.random() * 40),
                        });
                    }
                }, CONFIG.SIMULATED_LATENCY_MS);
            });
        }

        form.addEventListener("submit", function (e) {
            e.preventDefault();
            clearStatus();

            // Bots fill every field, including the ones humans never see.
            var honeypot = document.getElementById("wl-company");
            if (honeypot && honeypot.value.trim() !== "") {
                form.reset();
                showStatus(
                    "success",
                    "You're on the list. We'll be in touch shortly.",
                );
                return;
            }

            if (!validate()) {
                showStatus("error", "Fix the fields above and try again.");
                return;
            }

            var payload = {
                name: fields.name.value.trim(),
                email: fields.email.value.trim(),
                model: fields.model.value,
            };

            submitBtn.disabled = true;
            submitBtn.textContent = "Joining waitlist\u2026";

            simulateWaitlistRequest(payload)
                .then(function (result) {
                    showStatus(
                        "success",
                        "You're number " +
                            result.queuePosition +
                            " on the list. Confirmation is on its way to " +
                            payload.email +
                            ".",
                    );
                    form.reset();
                })
                .catch(function () {
                    showStatus(
                        "error",
                        "Something interrupted the connection. Nothing was lost. Try again when you're ready.",
                    );
                })
                .finally(function () {
                    submitBtn.disabled = false;
                    submitBtn.textContent = "Join the waitlist";
                });
        });

        // clear a field's error as soon as it becomes valid again
        Object.keys(fields).forEach(function (key) {
            fields[key].addEventListener("input", function () {
                if (fields[key].getAttribute("aria-invalid") === "true") {
                    // re-run just this field's check by nudging full validate silently
                    var el = errors[key];
                    if (el.classList.contains("is-visible")) {
                        setFieldError(key, "");
                    }
                }
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        initHeaderState();
        initScrollReveal();
        initWaveform();
        initWaitlistForm();
    });
})();
