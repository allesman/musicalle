<script lang="ts">
  import ThemeSwitch from "./ThemeSwitch.svelte";
  import Icon from "@iconify/svelte";
  import CreateCustomGame from "./CreateCustomGame.svelte";

  let createCustomGame: CreateCustomGame;
</script>

<CreateCustomGame bind:this={createCustomGame} />
<div class="navbar">
  <div class="navbar-start pl-2">
    <button
      class="btn btn-m btn-neutral text-base"
      on:click={() => createCustomGame.openModal()}
    >
      <Icon icon="mdi:sparkles-outline" class="text-xl" />Custom
    </button>
  </div>

  <a href="/" class="btn btn-ghost btn-lg text-4xl navbar-center">musicalle</a>

  <!-- aligned right -->
  <div class="navbar-end pr-2">
    <ThemeSwitch />
  </div>
</div>
<!-- <div class="divider" /> -->
